/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var DayCalendar = require('./Components/DayCalendar');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;

var DayCalendarDemo = React.createClass({
  render: function() {
    
    var start = new Date();
    var end = new Date();
    end.setHours(19);
    end.setMinutes(0);
    end.setSeconds(0);
    var events = [
      {title: 'P I J M haha haha fjeiofjweio fe fe few fewfew fewfewfew fe fef fewfwfew fefewf', startAt: start, endAt: end}

    ];

    return (
      <View style={styles.container}>
      <DayCalendar style={styles.dayCalendar} newEvent={events[0]} />
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },


});

AppRegistry.registerComponent('DayCalendarDemo', () => DayCalendarDemo);
