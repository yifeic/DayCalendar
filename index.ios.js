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

var startAtChange = function(newStartAt) {
  console.log('newStartAt', newStartAt);
};

var lengthChange = function(newLength) {
  console.log('newLength', newLength);
};

var DayCalendarDemo = React.createClass({
  render: function() {
    
    var start = new Date();
    start.setHours(17);
    start.setMinutes(0);
    start.setSeconds(0);


    var startB = new Date(start);
    startB.setHours(10);

    var events = [
      {title: 'Lorem ipsum dolor sit amet, ius ad pertinax oportere accommodare,', startAt: start, length: 90}

    ];

    var newEvent = {title: 'aaa aaa bbbbb', startAt: startB, length: 60};

    return (
      <View style={styles.container}>
        <DayCalendar 
          style={styles.dayCalendar} 
          events={events} 
          newEvent={newEvent} 
          onNewEventStartAtChange={startAtChange}
          onNewEventLengthChange={lengthChange} />
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
