const mysql = require('mysql')
const config = require('../config/config')
/**
 * 创建连接
 * @returns 
 */
const getConnection = () => {
    return mysql.createConnection({
        host: config.db.host || '127.0.0.1',
        port: config.db.port || '3306',
        user: config.db.user || 'root',
        password: config.db.password || '',
        database: config.db.database || 'zentao'
        
    })
}

exports.getConnection = getConnection

const dbQuery = (sql) => {
    const connection = getConnection()
    connection.connect()
    return new Promise(resolve=> {
        connection.query(sql,(error,results)=>{
            if(!error) {
                resolve(results)
            }else {
                console.log(sql,'执行错误')
            }
            connection.end()
        })
    })
}
exports.dbQuery = dbQuery

