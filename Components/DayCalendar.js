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
  PanResponder,
} = React;

var HOURS_COUNT = 25;
var HOURS = [];
for (var i = 0; i < HOURS_COUNT; i++) {
    var hour = moment().hour(i).minute(0).second(0).format('h:mma');
    HOURS.push(hour);
}
var MINUTES_INA_DAY = 60*24;

var DayCalendar = React.createClass({

  panResponder: {},
  resizeResponder: {},
  draggableViewPreviousTop: 0,
  draggableViewPreviousHeight: 0,
  draggableView: null,
  resizeHandleView: null,
  draggableViewTopAndHeight: {},
  scrollView: null,
  totalHeight: 0,
  beginOfDay: null,
  endOfDay: null,

  propTypes: {
    style: View.propTypes.style,
    eventBoxStyle: View.propTypes.style,
    day: React.PropTypes.instanceOf(Date), 
    events: React.PropTypes.array,
    newEvent: React.PropTypes.object,
    timelineHeight: React.PropTypes.number,
    timelineGap: React.PropTypes.number,
    onNewEventStartAtChange: React.PropTypes.func,
    onNewEventLengthChange: React.PropTypes.func,
  },

  getDefaultProps: function() {
    return { day: new Date(), events: [], timelineHeight: 1, timelineGap: 59 };
  },

  getInitialState: function() {
    return {
      newEvent: this.props.newEvent
    };
  },

  _onPropsChange: function(props) {
    this.totalHeight = (HOURS_COUNT-1) * (props.timelineGap + props.timelineHeight);
    this.beginOfDay = moment(props.day).hour(0).minute(0).second(0);
    this.endOfDay = moment(props.day).hour(24).minute(0).second(0);

    if (this.props.newEvent) {
      this.draggableViewTopAndHeight = this._topAndHeightFromEvent(props.newEvent);
      this.draggableViewPreviousTop = this.draggableViewTopAndHeight.top;
      this.draggableViewPreviousHeight = this.draggableViewTopAndHeight.height;
    }
  },

  componentWillMount: function() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
    });
    this.resizeResponder = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onPanResponderMove: this._handleResizeResponderMove,
      onPanResponderRelease: this._handleResizeResponderEnd,
      onPanResponderTerminate: this._handleResizeResponderEnd,
    });

    this._onPropsChange(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    this._onPropsChange(nextProps);
    this.setState({
      newEvent: nextProps.newEvent
    });
  },

  componentDidMount: function() {
    this._updateDraggableViewPosition();
  },

  _updateDraggableViewPosition: function() {
    this.draggableView && this.draggableView.setNativeProps(this.draggableViewTopAndHeight);
  },

  _handleStartShouldSetPanResponder: function(e, gestureState) {
    // Should we become active when the user presses down on the circle?
    console.log('_handleStartShouldSetPanResponder');
    this.scrollView.setNativeProps({scrollEnabled: false});
    return true;
  },

  _handlePanResponderMove: function(e, gestureState) {
    this.draggableViewTopAndHeight.top = this.draggableViewPreviousTop + gestureState.dy;
    this._updateDraggableViewPosition();
  },
  _handleResizeResponderMove: function(e, gestureState) {
    this.draggableViewTopAndHeight.height = this.draggableViewPreviousHeight + gestureState.dy;
    this._updateDraggableViewPosition();
  },

  _handlePanResponderEnd: function(e, gestureState) {

    console.log("_handlePanResponderEnd");
    this.scrollView.setNativeProps({scrollEnabled: true});
    
    this.draggableViewPreviousTop += gestureState.dy;

    var newStartAt = this._dateFromY(this.draggableViewPreviousTop);
    this.props.onNewEventStartAtChange && this.props.onNewEventStartAtChange(newStartAt);

    this.setState({
      newEvent: {
        title: this.state.newEvent.title,
        startAt: newStartAt,
        length: this.state.newEvent.length
      }
    });
  },
  _handleResizeResponderEnd: function(e, gestureState) {

    console.log("_handleResizeResponderEnd");
    this.scrollView.setNativeProps({scrollEnabled: true});

    this.draggableViewPreviousHeight += gestureState.dy;

    var newLength = this._minutesFromPt(this.draggableViewPreviousHeight);
    this.props.onNewEventLengthChange && this.props.onNewEventLengthChange(newLength);

    this.setState({
      newEvent: {
        title: this.state.newEvent.title,
        startAt: this.state.newEvent.startAt,
        length: newLength
      }
    });
  },

  _topAndHeightFromEvent: function(event) {
    var beginOfDay = this.beginOfDay;
    var endOfDay = this.endOfDay;

    var startAt = beginOfDay.isAfter(event.startAt) ? beginOfDay : moment(event.startAt);
    startAt = startAt.second(0);

    var maxLength = endOfDay.diff(startAt, 'minutes');

    var startAtInMinutes = startAt.diff(beginOfDay, 'minutes');
    var lengthInMinutes = Math.ceil(Math.min(event.length, maxLength));
    
    var top = startAtInMinutes / MINUTES_INA_DAY * this.totalHeight;
    var height = lengthInMinutes / MINUTES_INA_DAY * this.totalHeight;

    return {top, height};
  },

  _isEventInDay: function(event) {
    var endAt = moment(event.startAt).add(event.length, 'minutes');
    return !(this.endOfDay.isBefore(event.startAt) || this.beginOfDay.isAfter(endAt));
  },

  _filteredEvents: function() {
    return this.props.events.filter(this._isEventInDay);
  },

  _dateFromY: function(y) {
    var minutes = Math.round(y / this.totalHeight * MINUTES_INA_DAY);

    return moment(this.beginOfDay).add(minutes, 'minutes').toDate();
  },

  _minutesFromPt: function(pt) {
    return Math.round(pt / this.totalHeight * MINUTES_INA_DAY);
  },

  render: function() {
    console.log('render');

    var timelineStyles = StyleSheet.create({
      timeline: {
        height: this.props.timelineHeight,
        marginBottom: this.props.timelineGap,
      },
      timelineLast: {
        height: this.props.timelineHeight,
      },
    });

    var createTimeline = (time, i) => <Timeline key={'time'+i} time={time} style={i == HOURS_COUNT-1 ? timelineStyles.timelineLast : timelineStyles.timeline} />;

    var createEventBox = (event, i) => {

      var topAndHeight = this._topAndHeightFromEvent(event);

      return (<EventBox key={i} style={[styles.eventBoxPosition, topAndHeight, this.props.eventBoxStyle]} title={event.title} />);
    };

    var createNewEventBox = (event) => {

      var topAndHeight = this._topAndHeightFromEvent(event);

      return (
        <View ref={(box) => {this.draggableView = box;}} style={[styles.eventBoxPosition, topAndHeight]} {...this.panResponder.panHandlers}>
          <EventBox style={this.props.eventBoxStyle} title={event.title}/>
          <View ref={(view) => {this.resizeHandleView = view;}} style={styles.resizeHandleView} {...this.resizeResponder.panHandlers}/>
        </View>
      );
    };

    return (
      <ScrollView ref={(scrollView) => {this.scrollView = scrollView;}}>
        
        {HOURS.map(createTimeline)}
        {this._filteredEvents().map(createEventBox)}
        {this.state.newEvent && createNewEventBox(this.state.newEvent)}

      </ScrollView>
    );
  },
});


var styles = StyleSheet.create({
  eventBoxPosition: {
    position: 'absolute', left: 80, right: 20,
  },
  resizeHandleView: {
    position: 'absolute', right:10, bottom: 0, width: 30, height: 20, backgroundColor: 'red'
  }
});

module.exports = DayCalendar;
