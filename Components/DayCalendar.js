'use strict';

var React = require('react-native');
var Timeline = require('./Timeline');
var EventBox = require('./EventBox');
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
    var hour = moment().hour(i).minute(0).second(0).format('h:mma');
    HOURS.push(hour);
}
var MINUTES_INA_DAY = 60*24;

class DayCalendar extends React.Component {

  render() {
    var createTimeline = (time, i) => <Timeline key={i} time={time} style={i == HOURS_COUNT-1 ? styles.timelineLast : styles.timeline} />;
    var beginOfDay = moment(this.props.day).hour(0).minute(0).second(0);
    var endOfDay = moment(this.props.day).hour(24).minute(0).second(0);

    var isEventInDay = (event) => !(endOfDay.isBefore(event.startAt) || beginOfDay.isAfter(event.endAt));
    var createEventBox = function (event, i) {


      var startAt = beginOfDay.isAfter(event.startAt) ? beginOfDay : moment(event.startAt);
      var endAt = endOfDay.isBefore(event.endAt) ? endOfDay : moment(event.endAt);

      startAt = startAt.second(0);
      endAt = endAt.second(0);

      var startAtInMinutes = startAt.diff(beginOfDay, 'minutes');
      var lengthInMinutes = endAt.diff(startAt, 'minutes');

      var totalHeight = (HOURS_COUNT-1) * (this.props.timelineGap + this.props.timelineHeight);
      
      var eventBoxTop = startAtInMinutes / MINUTES_INA_DAY * totalHeight;
      var eventBoxHeight = lengthInMinutes / MINUTES_INA_DAY * totalHeight;

      return (<EventBox style={{position: 'absolute', top: eventBoxTop, height: eventBoxHeight, left: 80, right: 20}} title={event.title} />);
    };

    return (
      <ScrollView>
        
        {HOURS.map(createTimeline)}
        
        {this.props.events.filter(isEventInDay).map(createEventBox.bind(this))}

      </ScrollView>
    );
  }
}

DayCalendar.propTypes = { 
  day: React.PropTypes.instanceOf(Date), 
  events: React.PropTypes.array,
  timelineHeight: React.PropTypes.number,
  timelineGap: React.PropTypes.number,
};
DayCalendar.defaultProps = { day: new Date(), events: [], timelineHeight: 1, timelineGap: 60 };

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
