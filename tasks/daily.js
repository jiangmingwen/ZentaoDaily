const { dbQuery } = require("../utils/db.util")
const { sendMail, getEmailContent} = require('../utils/mail.util')
const moment = require('dayjs')
const config = require('../config/config')

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
            DATEDIFF(te.date,t.deadline) diff_day,
            t.name task_name,
            t.id task_id,
            t.STATUS,
            t.deadline,
            t.consumed task_consumed,
            t.type task_type,
            t.pri task_pri,
            t.realStarted,
            t.finishedDate,
            t.estimate,
            p.id project_id,
            p.name project_name,
            te.*,
            u.realname 
        FROM
            zt_taskestimate te
            LEFT JOIN zt_task t ON t.id = te.task
            LEFT JOIN zt_user u ON te.account = u.account
            LEFT JOIN zt_project p ON t.project = p.id 
        WHERE
            u.realname IN ('${users.join("','")}') 
            AND te.date >= '${startTime}' 
            AND te.date < '${endTime}' 
            AND t.deleted = '0' 
        ORDER BY
            t.project
        `
        const tasks = await  dbQuery(taskSql) 
        //今日时间
        let todoTime = moment().format('YYYY-MM-DD')
        if(!config.daily.prev) { 
            //日报是统计今天的，将要做的任务是统计明天的
            todoTime = moment( new Date(todoTime).getTime() + 24 * 60 * 60 * 1000).format('YYYY-MM-DD')
        }
        const todoTaskSql = `
            SELECT 
                DATEDIFF(NOW(),t.deadline) diff_day,
                t.name task_name,
                t.id task_id,
                t.STATUS,
                t.deadline,
                t.consumed task_consumed,
                t.type task_type,
                t.pri task_pri,
                t.realStarted,
                t.finishedDate,
                t.estimate,
                p.id project_id,
                p.name project_name,
                u.realname
            from
                zt_task t 
                LEFT JOIN zt_user u ON t.assignedTo = u.account
                LEFT JOIN zt_project p ON t.project = p.id 
            WHERE 
                t.deleted = '0'
                AND  u.realname IN ('${users.join("','")}') 
                AND  t.deadline <= '${todoTime}'
                AND  t.deadline > '0000-00-00'
                AND  t.status IN ('wait','doing','pause')
            ORDER BY
	            t.deadline ASC
        `
        //截止时间是今天的任务
        const todoTask = await  dbQuery(todoTaskSql) 


        const bugSql = `
        SELECT
            DATEDIFF(b.resolvedDate,b.deadline) diff_day,
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
            p.id project_id,
            u.account,
            u.realname 
        FROM
            zt_user u,
            zt_bug b,
            zt_project p 
        WHERE
            u.realname in ('${users.join("','")}') 
            AND b.deleted = '0'
            AND b.resolvedBy = u.account 
            AND b.project = p.id 
            AND b.resolvedDate >= '${startTime}' 
            AND b.resolvedDate < '${endTime}'
        ORDER BY b.project
        `	


        const bugs = await dbQuery(bugSql)

        const todoBugSql = `
        SELECT 
            t.* ,
            u.realname,
            u.account,
            p.id project_id,
            p.name project_name,
            DATEDIFF(NOW(),t.deadline)  diff_day
        FROM 
            zt_bug t 
            LEFT JOIN zt_user u ON t.assignedTo = u.account
            LEFT JOIN zt_project p ON t.project = p.id 
        WHERE 
            t.deleted = '0'
            AND t.deadline <= '${todoTime}'
            AND t.deadline > '0000-00-00'
            AND t.status = 'active'
        ORDER BY
            t.deadline ASC
        `

        //截止时间是今天的bug
        const todoBug = await dbQuery(todoBugSql) 


        const usersList = emails.map(item=> ({
            realname: item.realname,
            account: item.account,
            task: [],
            bug: [],
            todoTask: [],
            todoBug: []
        }))

        tasks.forEach(resItem=> {
            let  existItem = usersList.find(p => p.realname === resItem.realname)
            existItem?.task?.push(resItem)
        })

        bugs.forEach(resItem=> {
            const  existItem = usersList.find(p => p.realname === resItem.realname)
            existItem?.bug?.push(resItem)
        })

        todoTask.forEach(resItem => {
            let  existItem = usersList.find(p => p.realname === resItem.realname)
            existItem?.todoTask?.push(resItem)
        })
        todoBug.forEach(resItem => {
            let  existItem = usersList.find(p => p.realname === resItem.realname)
            existItem?.todoBug?.push(resItem)
        })

        const adminUsers = config.daily.redirectEmails
        //如果配置了分组接受
        if(config.daily.hasOwnProperty('leaders')) {
            if(adminUsers.length){
                const content = getEmailContent(usersList)
                sendMail(content,adminUsers)
            }
            emails.forEach(emailItem=> {
                const realname = emailItem.realname
                const leaders = config.daily.leaders[realname] || []
                
                if(leaders && leaders.length) {
                    //发送组长和组员的邮件
                    const list = []
                    usersList.forEach(p => {
                        if(p.realname === realname || leaders.includes(p.realname ) ){
                            list.push(p)
                        }
                    })
                    if(list.length){
                        let content = getEmailContent(list)
                        sendMail(content,[emailItem.email])
                    }
                }else {
                    //发送单个人的邮件
                    const selfContent = usersList.find( p => realname === p.realname)
                    let content = getEmailContent([selfContent])
                    sendMail(content,[emailItem.email])
                }
            })
        }else {
            //如果没有配置分组接受
            //则每个人都接受所有人的，这里就是公开-透明的模式
            emails = emails?.map(item => item.email)?.filter(item => !!item)
            const content = getEmailContent(usersList)
            sendMail(content,[...adminUsers,...emails])
        }
}