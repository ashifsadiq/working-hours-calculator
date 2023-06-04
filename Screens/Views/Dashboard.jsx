import { FlatList, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import React, { useEffect, useState } from 'react';
import SqlStorage from '../Config/SqlStorage.config';
import {
  AsyncStorageItems,
  getKeyAsync,
  storeKeyAsync,
} from '../Functions/AsyncStorage.config';
import { Colors } from 'react-native/Libraries/NewAppScreen';


const sqlStorage = new SqlStorage();
const Dashboard = () => {
  let interval;
  const refreshEveryMs = 3000; // every 3 seconds;
  const isDarkMode = useColorScheme() === 'dark';
  const [isClockIn, setIsClockIn] = useState(false);
  const [logData, setLogData] = useState([
    {
      notes: null,
      clock_in_date: '2023-06-04',
      clock_out_date: null,
      clock_in_time: '10-22-05',
      clock_out_time: null,
      id: 1,
    },
  ]);

  const getAllData = () => {
    sqlStorage
      .selectAll()
      .then(res => {
        let temp = [];
        for (let i = 0; i < res.rows.length; i++) {
          const data = res.rows.item(i);
          // Extract clock-in and clock-out times
          let working_hours = null;
          // Extract clock-in and clock-out times
          const clockInTime = new Date(`${data.clock_in_date}T${data.clock_in_time}`);
          const clockOutTime = data.clock_out_date ? new Date(`${data.clock_out_date}T${data.clock_out_time}`) : new Date();

          // Calculate the time difference
          const timeDiff = Math.abs(clockOutTime - clockInTime);

          // Calculate hours, minutes, and seconds
          const hours = Math.floor(timeDiff / 3600000);
          const minutes = Math.floor((timeDiff % 3600000) / 60000);
          const seconds = Math.floor((timeDiff % 60000) / 1000);

          // Format the time components
          const formattedTime = `${hours}h ${minutes}m ${seconds}s`;
          working_hours = formattedTime;
          temp.push({ ...data, working_hours, is_clock_out: data.clock_out_time });
        }
        setLogData(temp);
      })
      .catch(error => {
        console.error('Error selecting data:', error);
      });
  };

  const handleClockOut = () => {
    getKeyAsync({
      key: AsyncStorageItems.lastLoginSqlId
    }).then(lastLoginSqlId => {
      sqlStorage.clockOut({
        sqlId: lastLoginSqlId
      }).then(res => {
        storeKeyAsync({
          key: AsyncStorageItems.isClockIn,
          value: false,
        });
        storeKeyAsync({
          key: AsyncStorageItems.lastLoginSqlId,
          value: null,
        });
        setIsClockIn(false);
      })
    });
  };
  const handleClockIn = () => {
    sqlStorage
      .clockIn()
      .then(results => {
        storeKeyAsync({
          key: AsyncStorageItems.isClockIn,
          value: true,
        });
        storeKeyAsync({
          key: AsyncStorageItems.lastLoginSqlId,
          value: results.insertId,
        });
        setIsClockIn(true);
      })
      .catch(error => {
        console.error('Error selecting data:', error);
      });
  };
  useEffect(() => {
    sqlStorage.createTable();
    getKeyAsync({
      key: AsyncStorageItems.isClockIn
    }).then(isClockIn => setIsClockIn(isClockIn))
    interval = setInterval(() => {
      getAllData();
    }, refreshEveryMs);
    return () => {
      clearInterval(interval);
    };
  }, []);
  const RenderLogItem = ({ item, index }) => {
    return (
      <View style={[styles.logItem, { backgroundColor: isDarkMode ? (item.is_clock_out ? Colors.darker : '#677079') : (item.is_clock_out ? Colors.lighter : '#677079'), }]}>
        <Text style={[styles.logItemText, { color: isDarkMode ? Colors.white : Colors.black, }]}>{item.clock_in_date}</Text>
        <Text style={[styles.logItemText, { color: isDarkMode ? Colors.white : Colors.black, }]}>{item.clock_in_time}</Text>
        <Text style={[styles.logItemText, { color: isDarkMode ? Colors.white : Colors.black, }]}>{item.working_hours}</Text>
      </View>
    );
  };
  return (
    <View>
      <Text style={styles.title}>Clock In/Out</Text>
      {!isClockIn ? (
        <TouchableOpacity style={[styles.button, { backgroundColor: isDarkMode ? Colors.lighter : Colors.darker, }]} onPress={handleClockIn}>
          <Text style={[styles.buttonText, { color: isDarkMode ? Colors.black : Colors.white, }]}>Clock In</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.button, { backgroundColor: isDarkMode ? Colors.lighter : Colors.darker, }]} onPress={handleClockOut}>
          <Text style={[styles.buttonText, { color: isDarkMode ? Colors.black : Colors.white, }]}>Clock Out</Text>
        </TouchableOpacity>
      )}
      {/* log Container  */}
      <View style={styles.logContainer}>
        <FlatList
          style={styles.logContainer}
          data={logData}
          renderItem={({ item, index }) => (
            <View>
              {index == 0 && <View style={[styles.logItem, { backgroundColor: isDarkMode ? Colors.darker : Colors.lighter, }]}>
                <Text style={[styles.logItemText, { color: isDarkMode ? Colors.white : Colors.black, backgroundColor: isDarkMode ? Colors.darker : Colors.lighter, }]}>In-Date</Text>
                <Text style={[styles.logItemText, { color: isDarkMode ? Colors.white : Colors.black, backgroundColor: isDarkMode ? Colors.darker : Colors.lighter, }]}>In-Time</Text>
                <Text style={[styles.logItemText, { color: isDarkMode ? Colors.white : Colors.black, backgroundColor: isDarkMode ? Colors.darker : Colors.lighter, }]}>Hours</Text>
              </View>
              }
              <RenderLogItem item={item} index={index} />
            </View>
          )}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "50%",
    alignSelf: 'center'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  logContainer: {
    marginTop: 20,
  },
  logItem: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: "95%",
    alignSelf: 'center',
    borderRadius: 10,
    paddingVertical: 10
  },
  logItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1
  },
});
