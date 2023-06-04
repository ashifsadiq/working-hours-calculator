import SQLite from 'react-native-sqlite-storage';
import { getCurrentDate, getCurrentTime } from './Time';

class MyComponent {
    constructor() {
        this.db = SQLite.openDatabase(
            {
                name: 'personal.db',
                location: 'default',
            },
            () => { },
            error => {
                console.error('Failed to open database:', error);
            }
        );
        this.tables = [
            {
                name: "working_hours",
                columns: [
                    { name: "clock_in_time", type: "TEXT" },
                    { name: "clock_in_date", type: "DATE" },
                    { name: "clock_out_time", type: "TEXT" },
                    { name: "clock_out_date", type: "DATE" },
                    { name: "notes", type: "TEXT" }
                ]
            }
        ]
    }

    ExecuteQuery = ({ query }) => {
        console.log({ query })
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(
                    query,
                    [],
                    (_, result) => resolve(result),
                    (error) => {
                        console.error(`Error executing "${query}":`, error);
                        reject(error);
                    }
                );
            });
        });
    };

    createTable() {
        const createTableQueries = this.tables.map(table => {
            const { name, columns } = table;
            const columnDefinitions = columns.map(column => `${column.name} ${column.type}`).join(", ");
            const query = `CREATE TABLE IF NOT EXISTS ${name} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${columnDefinitions})`;
            return this.ExecuteQuery({ query });
        });
        return Promise.all(createTableQueries);
    }
    clockIn() {
        const query = `INSERT INTO working_hours (clock_in_time, clock_in_date) VALUES ('${getCurrentTime()}', '${getCurrentDate()}')`
        return this.ExecuteQuery({ query });
    }
    clockOut({
        sqlId,
        notes = null // optional
    }) {
        const query = `UPDATE working_hours SET clock_out_time='${getCurrentTime()}', clock_out_date='${getCurrentDate()}', notes=${notes} WHERE id=${sqlId}`
        return this.ExecuteQuery({ query });
    }
    selectAll() {
        const query = `SELECT * FROM working_hours ORDER BY clock_in_time DESC;`
        return this.ExecuteQuery({ query });
    }
    selectFromId({
        sqlId
    }) {
        const query = `SELECT * FROM working_hours WHERE id=${sqlId}`
        return this.ExecuteQuery({ query });
    }
}

export default MyComponent;
