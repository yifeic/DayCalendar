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
    start.setHours(17);
    start.setMinutes(0);
    start.setSeconds(0);
    var end = new Date();
    end.setHours(19);
    end.setMinutes(0);
    end.setSeconds(0);


    var startB = new Date(start);
    startB.setHours(10);
    var endB = new Date(end);
    endB.setHours(11);
    var events = [
      {title: 'Lorem ipsum dolor sit amet, ius ad pertinax oportere accommodare,', startAt: start, endAt: end}

    ];

    var newEvent = {title: 'aaa aaa bbbbb', startAt: startB, endAt: endB};

    return (
      <View style={styles.container}>
      <DayCalendar style={styles.dayCalendar} events={events} newEvent={newEvent} />
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
