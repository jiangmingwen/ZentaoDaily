const { dbQuery } = require("../utils/db.util")
const { sendMail, getEmailContent} = require('../utils/mail.util')

module.exports = async (users,startTime,endTime) => {
    const emailSql =  `
    SELECT 
        email,
        account,
        realname 
    FROM 
        zt_user
    WHERE 
        realname in ('${users.join("','")}')`
    
    let emails = await dbQuery(emailSql)

    const taskSql = `
        SELECT
            p.name project_name,
            t.project,
            u.account,
            u.realname,
            t.id task_id,
            t.name task_name,
            t.type task_type,
            t.pri task_pri,
            t.consumed task_consumed,
            te.consumed calc_consumed,
            t.realStarted,
            t.estimate 
        FROM
            zt_user u,
            zt_task t,
            zt_taskestimate te,
            zt_project p 
        WHERE
            u.realname in ('${users.join("','")}') 
            AND u.account = t.lastEditedBy 
            AND te.task = t.id 
            AND p.id = t.project 
            AND t.lastEditedDate > '${startTime }' 
            AND te.date >= '${startTime}' 
            AND te.date < '${endTime}' AND te.consumed > 0
        ORDER BY t.project
        `
        console.log(taskSql,'taskSql')
        const tasks = await  dbQuery(taskSql) 
        const bugSql = `
        SELECT
            b.id,
            b.title,
            b.severity,
            b.pri,
            b.status,
            b.activatedCount,
            b.project,
            b.resolvedBuild,
            b.closedDate,
            p.name project_name,
            u.account,
            u.realname 
        FROM
            zt_user u,
            zt_bug b,
            zt_project p 
        WHERE
            u.realname in ('${users.join("','")}') 
            AND b.resolvedBy = u.account 
            AND b.project = p.id 
            AND b.resolvedDate >= '${startTime}' 
            AND b.resolvedDate < '${endTime}'
        ORDER BY b.project
        `	
        console.log(bugSql,'bugSql')
        const bugs = await dbQuery(bugSql)
        const usersList = emails.map(item=> ({
            realname: item.realname,
            account: item.account,
            task: [],
            bug: []
        }))
        tasks.forEach(resItem=> {
            let  existItem = usersList.find(p => p.realname === resItem.realname)
            existItem.task.push(resItem)
        })

        bugs.forEach(resItem=> {
            const  existItem = usersList.find(p => p.realname === resItem.realname)
            existItem.bug.push(resItem)
        })

    
        emails = emails?.map(item => item.email)?.filter(item => !!item)
        if(emails?.length){
            const content = getEmailContent(usersList)
            sendMail(content,emails)
        }
}