module.exports = {
    zentaoHome:  'http://192.168.16.92:8888/zentao',
    email: {
        username: 'your.email',
        password: 'your.password',
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
        users: ['姜明文','肖礼文','廖薇','孟成华','王坤'],
        hour: 9,
        prev: true
    }
}