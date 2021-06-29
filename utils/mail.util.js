const config = require('../config/config')
const nodemailer = require('nodemailer');
const  moment = require( 'dayjs')


const sendMail = (content,users) => {
    const transporter  =  nodemailer.createTransport({
        service: config.email.service,
        host:config.email.host,
        port: config.email.port,
        secureConnection: config.email.ssl,
        auth: {
            user: config.email.username || '',
            pass: config.email.password || ''
        }
    })
    //不统计的人也想接收邮件
    const to = [...config.daily.redirectEmails,users].join(',')
    transporter.sendMail({
        from: config.email.username,
        to,
        subject: 'Zentao Daily「' + moment().format('YYYY-MM-DD')+'」',
        html: content
    },(error,info)=> {
        if (error) {
            return console.log(error);
          }
          console.log(info)
    })

}

exports.sendMail = sendMail
const oddStyle = `background-color: #F6F7FA;`

function getBugItemContent(index,bugInfo){
    const statusMap = {
        active: '激活',
        resolved: '已解决',
        closed: '已关闭',
    }
    const template = `<div style="display: flex;height: 45px;align-items: center;${index%2 ?oddStyle:'' }">
    <div style="flex: 0 0 50px">${bugInfo.id}</div>
    <div style="flex: 1;padding-right: 16px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" title="${bugInfo.title}">
        <a href="${config.zentaoHome}/bug-view-${bugInfo.id}.html">${bugInfo.title}</a>
    </div>
    <div style="flex: 0 0 80px">${bugInfo.severity}</div>
    <div style="flex: 0 0 80px">${bugInfo.pri}</div>
    <div style="flex: 0 0 80px">${bugInfo.activatedCount}</div>
    <div style="flex: 0 0 80px">${bugInfo.resolvedBuild == 'trunk'?'主干':bugInfo.resolvedBuild}</div>
    <div style="flex: 0 0 70px">${statusMap[bugInfo.status]||''}</div>
    <div style="flex: 0 0 100px">${bugInfo.closedDate !== '0000-00-00 00:00:00' ?moment(bugInfo.closedDate).format('YYYY-MM-DD'):'无'}</div>
    <div style="flex: 0 0 150px";overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" title="${bugInfo.project_name}">${bugInfo.project_name}</div>
</div>`
return template
}

const types = {
    design: '设计',
    devel: '研发',
    test: '测试',
    study: '研究',
    discuss: '讨论',
    ui: '界面',
    affair: '事务',
    misc: '其他',
}



function getTaskItemContent(index,taskInfo){
    const template = ` <div style="display: flex;height: 45px;align-items: center;${index%2 ?oddStyle:'' }">
    <div style="flex: 0 0 50px">${taskInfo.task_id}</div>
    <div style="flex: 1;padding-right: 16px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" title="${taskInfo.task_name}">
        <a href="${config.zentaoHome}/task-view-${taskInfo.task_id}.html">${taskInfo.task_name}</a>
    </div>
    <div style="flex: 0 0 60px">${taskInfo.calc_consumed||0 }</div>
    <div style="flex: 0 0 100px;color:${taskInfo.status !== 'done' && taskInfo.over?'red':''}">${taskInfo.deadline==='0000-00-00'?'无':moment(taskInfo.deadline).format('YYYY-MM-DD')}</div>
    <div style="flex: 0 0 80px">${taskInfo.task_pri}</div>
    <div style="flex: 0 0 80px">${taskInfo.task_consumed}</div>
    <div style="flex: 0 0 80px">${taskInfo.estimate}</div>
    <div style="flex: 0 0 50px">${types[taskInfo.task_type] || ''}</div>
    <div style="flex: 0 0 100px">${taskInfo.realStarted !== '0000-00-00 00:00:00'?moment(taskInfo.realStarted).format('YYYY-MM-DD'):'未开始'}</div>
    <div style="flex: 0 0 150px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" title="${taskInfo.project_name}">${taskInfo.project_name}</div>
</div>`
return template
}


function getEmailContent(list){
    let content = ''
    list.forEach(item => {
        let taskTexts = ''
        let bugTexts = ''
        const tasks = item.task || []
        const bugs = item.bug || []
        tasks.forEach((taskItem,index) => {
            taskTexts+= getTaskItemContent(index,taskItem)
        })
        bugs.forEach((bugItem,index) => {
            bugTexts+= getBugItemContent(index,bugItem)
        })
        const count = tasks.filter(item => !item.over).length
        content += getDailyUserContent(item.realname,taskTexts,bugTexts,tasks.length,bugs.length,count)
    })
    return content
}

exports.getEmailContent = getEmailContent

const taskHeader = `
<div style="display: flex;">
    <div style="flex: 0 0 50px">编号</div>
    <div style="flex: 1;padding-right: 16px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">任务名称</div>
    <div style="flex: 0 0 60px">工时</div>
    <div style="flex: 0 0 100px">截止时间</div>
    <div style="flex: 0 0 80px">优先级</div>
    <div style="flex: 0 0 80px">总耗时</div>
    <div style="flex: 0 0 80px">预计</div>
    <div style="flex: 0 0 50px">类型</div>
    <div style="flex: 0 0 100px">开始时间</div>
    <div style="flex: 0 0 150px">项目</div>
</div>`

const bugHeader = `
<div style="display: flex;">
    <div style="flex: 0 0 50px">编号</div>
    <div style="flex: 1;padding-right: 16px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">bug名称</div>
    <div style="flex: 0 0 80px">严重程度</div>
    <div style="flex: 0 0 80px">优先级</div>
    <div style="flex: 0 0 80px">激活次数</div>
    <div style="flex: 0 0 80px">解决版本</div>
    <div style="flex: 0 0 70px">状态</div>
    <div style="flex: 0 0 100px">关闭时间</div>
    <div style="flex: 0 0 150px">项目</div>
</div>
`

const emptyContent = `
<div style="display: flex;align-items: center;justify-content: center; ">
    无
</div>
`

function getDailyUserContent(user,taskContent,bugContent,taskCount,bugCount,doneTaskCount){
    const emailTemplate = ` <div style="width: 1024px; margin: 32px 0;border: 1px solid #d8d8d8;">
    <div style="text-align: center;font-size: 18px;font-weight:bold;color:#fff;background-color: #767E95; padding: 8px 12px; " >${user}</div>
    <div style="display: flex;">
        <div style="flex: 0 0 80px;border-right: 1px solid #d8d8d8;padding: 8px 12px;
         display: flex;align-items: center;justify-content: center;
        ">任务(${doneTaskCount})</div>
        <div style="padding: 8px 12px;flex: 1">
            ${taskCount>0? taskHeader: emptyContent} 
            ${taskContent}
        </div>
    </div>
    <div style="display: flex;border-top: 1px solid #d8d8d8;">
         <div style="flex: 0 0 80px;border-right: 1px solid #d8d8d8;padding: 8px 12px;
         display: flex;align-items: center;justify-content: center;
        ">bug(${bugCount})</div>
        <div style="padding: 8px 12px;flex: 1">
            ${bugCount>0? bugHeader: emptyContent} 
            ${bugContent}
        </div>
     </div>
</div>`
   return emailTemplate
}
