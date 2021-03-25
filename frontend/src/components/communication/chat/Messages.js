import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";
import InfiniteScroll from "react-infinite-scroller";
import Message from "./Message";

const styles = (theme) => {
  return {
    receivedContainer: {
      textAlign: "left",
      marginLeft: theme.spacing(1),
    },
    sentContainer: {
      textAlign: "right",
      marginRight: theme.spacing(1),
    },
    messageContainer: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    receivedMessage: {
      backgroundColor: theme.palette.grey[300],
      padding: theme.spacing(1),
      paddingRight: theme.spacing(4),
    },
    sentMessage: {
      backgroundColor: theme.palette.primary.main,
      padding: theme.spacing(1),
      color: "white",
      textAlign: "left",
      paddingRight: theme.spacing(4),
    },
    message: {
      maxWidth: "70%",
      display: "inline-block",
      borderRadius: theme.spacing(1),
    },
    loader: {
      display: "inline-block",
      marginRight: theme.spacing(0.25),
    },
    noHistoryText: {
      textAlign: "center",
      fontStyle: "italic",
    },
  };
};

//Using a class component in order to access this.myRef, so that we can control the scroll position of the container
class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      isLoading: true,
    };
  }

  //scroll down when the component is mounted
  componentDidMount() {
    const messageContainer = this.myRef.current;
    messageContainer.scrollComponent.scrollTop = messageContainer.scrollComponent.scrollHeight;
    this.setState({
      isLoading: false,
    });
  }

  //scroll down when a new message is rendered
  componentDidUpdate(prevProps) {
    if (prevProps.messages != this.props.messages) {
      const messageContainer = this.myRef.current;
      messageContainer.scrollComponent.scrollTop = messageContainer.scrollComponent.scrollHeight;
    }
  }

  render() {
    const loadMore = async (page) => {
      if (!this.state.isLoading) {
        this.setState({
          isLoading: true,
        });
        await this.props.loadFunc(page);
        this.setState({
          isLoading: false,
        });
      }
    };
    const sortByNewestFirst = (a, b) => new Date(a.sent_at) - new Date(b.sent_at);
    return (
      <InfiniteScroll
        pageStart={0}
        loadMore={loadMore}
        hasMore={this.props.hasMore && !this.state.isLoading}
        loader={
          <div className={this.props.classes.loader} key={0}>
            Loading ...
          </div>
        }
        component="ul"
        spacing={2}
        isReverse
        className={this.props.className}
        ref={this.myRef}
      >
        {this.props.messages && this.props.messages.length > 0 ? (
          this.props.messages.sort(sortByNewestFirst).map((message, index) => {
            return (
              <Message
                message={message}
                key={index}
                classes={this.props.classes}
                chatting_partner={this.props.chatting_partner}
                isPrivateChat={this.props.isPrivateChat}
              />
            );
          })
        ) : this.props.isPrivateChat ? (
          <div className={this.props.classes.noHistoryText}>
            <p>
              {this.props.texts.this_is_the_very_beginning_of_your_conversation_with}{" "}
              {this.props.chatting_partner.first_name + " " + this.props.chatting_partner.last_name}
              .
            </p>
            <p>{this.props.texts.write_a_message_to_get_the_conversation_started}</p>
          </div>
        ) : (
          <div className={this.props.classes.noHistoryText}>
            <p>
              {this.props.texts.this_is_the_very_beginning_of_your_conversation_in}{" "}
              {this.props.title}
            </p>
            <p>{this.props.texts.write_a_message_to_get_the_conversation_started}</p>
          </div>
        )}
      </InfiniteScroll>
    );
  }
}

Messages.propTypes = {
  classes: PropTypes.object.isRequired,
  messages: PropTypes.array.isRequired,
  chatting_partner: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
  loadFunc: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  title: PropTypes.string,
  isPrivateChat: PropTypes.bool.isRequired,
};

export default withStyles(styles)(Messages);
