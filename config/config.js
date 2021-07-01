module.exports = {
    port: 8848,
    zentaoHome:  'http://192.168.16.92:8888/zentao',
    email: {
        username: 'dev@huanbo99.com',
        password: 'yfb123456',
        service: 'smtp.ym.163.com',
        host: 'smtp.ym.163.com',
        port: 25,
        ssl: false,
    },
    db: {
        user: 'root',
        password: '123456',
        host: '192.168.16.92',
        port: '3306',
        database: 'zentao',
        type: 'mysql'
    },
    daily: {
        active: true,
        users: [//组员只能接受自己任务完成情况
            '姜明文',
            '雷向阳',
            '张洪',
            '何海',
            '曾文豪',
            '周敏',
            '刘友君',
            '肖礼文',
            '廖薇',
            '孟成华',
            '王坤',
            '王伟',
            '黄礼文',
            '杨超',
            '谢佳怡',
            '王望',
            '刘敏',
            '李佳俊',
            '唐笙峰',
        ], 
        //如果不设置 leaders这个字段，则每个人接受所有人的信息
        leaders:{//组长能够接受组员完成的情况
            '姜明文': ['杨超','谢佳怡','曾文豪','刘友君'],//项目1组
            '雷向阳': ['肖礼文','谢佳怡'],//项目2左右
            '张洪': ['王伟','孟成华','廖薇','王望','周敏','唐笙峰'], //项目3组
            '何海': ['黄礼文','王坤','刘敏','谢佳怡','李佳俊'],//项目4组
            '刘友君': ['王望','刘敏'], //测试
            '周敏': ['谢佳怡','李佳俊'],//产品
            '曾文豪': ['王伟','张洪','黄礼文','何海','杨超','雷向阳'], //后端
        },
		redirectEmails: [//直接接受邮件的人，可以看所有
            'liping@huanbo99.com',
            'lixiaodong@huanbo99.com'
        ],
        hour: 9, //每天几点钟发送邮件， [0 , 23]
        prev: true //是统计今天，还是统计前一天，true=前一天
    }
}