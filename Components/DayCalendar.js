'use strict';

var React = require('react-native');
var Timeline = require('./Timeline');
var moment = require('moment');

var {
  StyleSheet,
  ScrollView,
  View,
  Text,
} = React;

var HOURS_COUNT = 25;
var HOURS = [];
for (var i = 0; i < HOURS_COUNT; i++) {
    var hour = moment().hour(i).second(0).minute(0).format('h:mma');
    HOURS.push(hour);
}

class DayCalendar extends React.Component {
  render() {
    var createTimeline = (time, i) => <Timeline key={i} time={time} style={i == HOURS_COUNT-1 ? styles.timelineLast : styles.timeline} />;

    return (
      <ScrollView>
        
        {HOURS.map(createTimeline)}
        
        <View style={styles.eventContainer}>
        <Text>aaa</Text>
        </View>
      </ScrollView>
    );
  }
}

DayCalendar.propTypes = { 
  day: React.PropTypes.instanceOf(Date), 
  events: React.PropTypes.array,
};
DayCalendar.defaultProps = { day: new Date(), events: [] };

var styles = StyleSheet.create({
  eventContainer: {
    position: 'absolute',
    top: 0,
    paddingLeft: 90,
  },
  timeline: {
    height: 1,
    marginBottom: 60,
  },
  timelineLast: {
    height: 1,
  }
});

module.exports = DayCalendar;
