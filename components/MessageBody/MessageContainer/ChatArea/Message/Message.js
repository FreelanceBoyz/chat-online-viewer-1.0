import React from 'react';
import moment from 'moment';
import { MessageWrapper } from './Message.style';

const Message = props => {
    const {
        data,
        isMine,
        startsSequence,
        endsSequence,
        showTimestamp
    } = props.mydata;

    const friendlyTimestamp = moment(data.timestamp).format('LLLL');

    return <MessageWrapper>
            <div className={[
                'message',
                `${isMine ? 'mine' : ''}`,
            ].join(' ')}>
            {
                showTimestamp &&
                    <div className="timestamp">
                        { friendlyTimestamp }
                    </div>
            }

                <div className="bubble-container">
                <div className="bubble" title={friendlyTimestamp}>
                    { data.message }
                </div>
                </div>
            </div>
        </MessageWrapper>
}

export default Message;