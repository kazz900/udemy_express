// const mysql = require('mysql2');

// const pool = mysql.createPool({
//     host:'192.168.1.100',
//     port:'3307',
//     user:'root',
//     database:'node-complete',
//     password:'Mpx0211!@'
// });

const {Sequelize} = require('sequelize');

// 회사
// const sequelize = new Sequelize('node-complete', 
//                                 'root', 
//                                 'Mpx0211!@', {
//                                     dialect:'mysql', 
//                                     host:'192.168.1.100', 
//                                     port:'3307',
//                                     pool: {
//                                         max: 100,
//                                         min: 0,
//                                         idle: 10000
//                                     }
//                                 }
// );

// 집
const sequelize = new Sequelize('node-complete', 
                                'root', 
                                'root', {
                                    dialect:'mysql', 
                                    host:'localhost', 
                                    pool: {
                                        max: 100,
                                        min: 0,
                                        idle: 10000
                                    }
                                }
);

module.exports = sequelize;


