

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
  Image,
} = React;

type Event = {
  title: string;
  startAt: Date;
  length: number;
};

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
  draggableView: (null : ?{ setNativeProps(props: Object): void }),
  resizeHandleView: (null : ?{ setNativeProps(props: Object): void }),
  draggableViewTopAndHeight: {},
  scrollView: (null : ?{ setNativeProps(props: Object): void }),
  totalHeight: 0,
  beginOfDay: null,
  endOfDay: null,

  propTypes: {
    style: View.propTypes.style,
    eventBoxStyle: View.propTypes.style,
    day: React.PropTypes.instanceOf(Date).isRequired, 
    events: React.PropTypes.array.isRequired,
    newEvent: React.PropTypes.object,
    timelineHeight: React.PropTypes.number.isRequired,
    timelineGap: React.PropTypes.number.isRequired,
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

    if (props.newEvent != null) {
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

  _handleStartShouldSetPanResponder: function(e: Object, gestureState: Object): boolean {
    // Should we become active when the user presses down on the circle?
    console.log('_handleStartShouldSetPanResponder');
    this.scrollView.setNativeProps({scrollEnabled: false});
    return true;
  },

  _handlePanResponderMove: function(e: Object, gestureState: Object) {
    this.draggableViewTopAndHeight.top = this.draggableViewPreviousTop + gestureState.dy;
    this._updateDraggableViewPosition();
  },
  _handleResizeResponderMove: function(e: Object, gestureState: Object) {
    this.draggableViewTopAndHeight.height = this.draggableViewPreviousHeight + gestureState.dy;
    this._updateDraggableViewPosition();
  },

  _handlePanResponderEnd: function(e: Object, gestureState: Object) {

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
  _handleResizeResponderEnd: function(e: Object, gestureState: Object) {

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

  _topAndHeightFromEvent: function(event: Event): {top: number; height: number} {
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

  _isEventInDay: function(event: Event): boolean {
    var endAt = moment(event.startAt).add(event.length, 'minutes');
    return !(this.endOfDay.isBefore(event.startAt) || this.beginOfDay.isAfter(endAt));
  },

  _filteredEvents: function(): Array<Event> {
    return this.props.events.filter(this._isEventInDay);
  },

  _dateFromY: function(y: number): Date {
    var minutes = Math.round(y / this.totalHeight * MINUTES_INA_DAY);

    return moment(this.beginOfDay).add(minutes, 'minutes').toDate();
  },

  _minutesFromPt: function(pt: number): number {
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
          <EventBox style={[this.props.eventBoxStyle, styles.newEventBox]} title={event.title}/>
          <Image ref={(view) => {this.resizeHandleView = view;}} source={require('image!icon-drag')} style={styles.resizeHandleView} {...this.resizeResponder.panHandlers}/>
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
  newEventBox: {
    backgroundColor: 'rgba(94, 190, 255, 0.8)',
    borderWidth: 0,
  },
  resizeHandleView: {
    position: 'absolute', right:0, bottom: -5, width: 40, height: 40,
  }
});

module.exports = DayCalendar;
