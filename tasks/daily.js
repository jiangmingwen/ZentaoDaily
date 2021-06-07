const { dbQuery } = require("../utils/db.util")
const { sendMail, getEmailContent} = require('../utils/mail.util')
const moment = require('dayjs')

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
    const today = moment().format('YYYY-MM-DD')

    const taskSql = `
    SELECT
        t.id task_id,
        p.NAME project_name,
        t.deadline < '${today}'  as over,
        t.status,
        t.project,
        t.deadline,
        u.account,
        u.realname,
        t.NAME task_name,
        t.type task_type,
        t.pri task_pri,
        t.consumed task_consumed,
        te.consumed calc_consumed,
        t.realStarted,
        t.estimate 
    FROM
        zt_task t
        LEFT JOIN zt_taskestimate te ON t.id = te.task
        LEFT JOIN zt_user u ON t.assignedTo = u.account
        LEFT JOIN zt_project p ON t.project = p.id 
    WHERE
        u.realname IN ( '${users.join("','")}' )
            AND (
            ( 
            u.account = t.lastEditedBy 
                AND te.task = t.id 
                AND t.lastEditedDate > '${startTime}' 
                AND te.date >= '${startTime}' 
                AND te.date < '${endTime}' 
                AND te.consumed > 0 
            ) 
            OR (
                t.deadline <  '${today}'
                AND t.deadline != '0000-00-00' 
                AND t.STATUS NOT IN ( 'done', 'cancel', 'closed' )
            ) 
        ) 
        ORDER BY t.project
        `
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