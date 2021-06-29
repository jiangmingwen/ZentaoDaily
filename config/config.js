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
        users: [
            '姜明文',
            '肖礼文',
            '廖薇',
            '孟成华',
            '王坤',
            '张洪',
            '王伟',
            '曾文豪',
            '黄礼文',
            '雷向阳',
            '何海',
            '杨超',
        ], 
		redirectEmails: [//直接接受邮件的
            'liping@huanbo99.com',
            'lixiaodong@huanbo99.com'
        ],
        hour: 9,
        prev: true
    }
}