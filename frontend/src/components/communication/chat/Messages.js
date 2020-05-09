import React from "react";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import MessageContent from "./../MessageContent";

const styles = theme => {
  return {
    receivedContainer: {
      textAlign: "left",
      marginLeft: theme.spacing(1)
    },
    sentContainer: {
      textAlign: "right",
      marginRight: theme.spacing(1)
    },
    messageContainer: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    },
    receivedMessage: {
      backgroundColor: theme.palette.grey[300],
      padding: theme.spacing(1)
    },
    sentMessage: {
      backgroundColor: theme.palette.primary.main,
      padding: theme.spacing(1),
      color: "white",
      textAlign: "left"
    },
    message: {
      maxWidth: "70%",
      display: "inline-block",
      borderRadius: theme.spacing(1)
    },
    noHistoryText: {
      textAlign: "center",
      fontStyle: "italic"
    }
  };
};

//Using a class component in order to access this.myRef, so that we can control the scroll position of the container
class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  //scroll down when the component is mounted
  componentDidMount() {
    const messageContainer = this.myRef.current;
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  //scroll down when a new message is rendered
  componentDidUpdate(prevProps) {
    if (prevProps.messages != this.props.messages) {
      const messageContainer = this.myRef.current;
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }

  render() {
    return (
      <div ref={this.myRef} className={this.props.className}>
        {this.props.messages && this.props.messages.length ? (
          this.props.messages.map((message, index) => {
            const received = message.sender === this.props.chatting_partner.url;
            return (
              <div
                key={index}
                className={`${
                  received ? this.props.classes.receivedContainer : this.props.classes.sentContainer
                } ${this.props.classes.messageContainer}`}
                id="messageContainer"
              >
                <span
                  color={received ? "default" : "primary"}
                  className={`${
                    received ? this.props.classes.receivedMessage : this.props.classes.sentMessage
                  } ${this.props.classes.message}`}
                >
                  {<MessageContent content={message.content} />}
                </span>
              </div>
            );
          })
        ) : (
          <div className={this.props.classes.noHistoryText}>
            <p>
              This is the very beginning of your conversation with{" "}
              {this.props.chatting_partner.name}.
            </p>
            <p>Write a message to get the conversation started!</p>
          </div>
        )}
      </div>
    );
  }
}

Messages.propTypes = {
  classes: PropTypes.object.isRequired,
  messages: PropTypes.array.isRequired,
  chatting_partner: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired
};

export default withStyles(styles)(Messages);
