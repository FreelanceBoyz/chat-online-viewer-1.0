import React, { useState, useEffect, useContext } from 'react';
import { List } from 'antd';
import { createPaginationContainer } from 'react-relay';
import { GetAllRoomFragment, GetAllRoomPaging } from 'relay/graphql/RoomGraph';
import MainContext from 'constants/MainContext';
import { FriendCard, FriendListWrapper, NewMessageCard, Spinning } from './FriendList.style';
import InfiniteScroll from 'react-infinite-scroller';

const FriendList = ({newMessage, discardNewMessage, rooms, relay, getActiveRoom, isAddNew}) => {
    const { currentUser } = useContext(MainContext);
    const [userDatas, setUserDatas] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (rooms?.allRooms?.edges?.length && currentUser) {
            const userDataList = rooms.allRooms.edges.map((edge, index) => {
                const { users, _id, lastMessage } = edge.node;
                const userFilters = users.filter((user) => user._id !== currentUser._id);
                return ({
                    index,
                    roomId: _id,
                    name: userFilters[0].name,
                    lastMessage,
                    active: false,
                })
            })
            setUserDatas(userDataList);
        }
    }, [currentUser, rooms])

    const handleClickFriendCard = (item) => {
        const newUserDatas = userDatas.map(user => {
            if (user.active === true) {
                user.active = false;
            }
            if (user.index === item.index) {
                user.active = true;
            }
            return user;
        });
        setUserDatas(newUserDatas);
        getActiveRoom(item.roomId, item.name);
    }

    useEffect(() => {
        if (isAddNew) {
            const editUser = {
                ...userDatas[0],
                active: true
            }
            const newUserDatas = [editUser, ...userDatas.slice(1)];
            setUserDatas(newUserDatas);
            getActiveRoom(userDatas[0].roomId, userDatas[0].name);
        }
    }, [isAddNew])

    useEffect(
        () => {
            if (newMessage) {
                const newUserDatas = userDatas.map(user => {
                    if (user.active === true) user.active = false;
                    return user;
                });
                setUserDatas(newUserDatas);
            }
        }, [newMessage]
    )

    useEffect(() => {
        if (loading) setLoading(false);
    }, [userDatas]);

    const loadMore = () => {
        if (relay.hasMore()) {
            relay.loadMore(10, error => console.log(error));
        }
    }

    return <FriendListWrapper>
        {newMessage ? <FriendCard newMessage active={true}>
            <section className="avatarsection">
                <img src="/avatar.png" className="avatar" />
            </section>
            <section className="info">
                <div className="content">New message</div>
                <div className="buttonarea">
                    <button className="discard" onClick={discardNewMessage}>x</button>
                </div>
            </section>
        </FriendCard> : null}
        <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={loadMore}
            hasMore={relay.hasMore()}
            useWindow={false}
        >
            <List 
                dataSource={userDatas}
                split={false}
                renderItem={
                    item => (
                        <FriendCard onClick={() => handleClickFriendCard(item)} active={item.active}>
                            <section className="avatarsection">
                                <img src="/avatar.png" className="avatar" />
                            </section>
                            <section className="info">
                                <div className="name">{item.name}</div>
                                <div>{item.lastMessage}</div>
                            </section>
                        </FriendCard>
                    )
                }
            />
            {loading && <Spinning><Spin /></Spinning>}
        </InfiniteScroll>
        
    </FriendListWrapper>
}

export default createPaginationContainer(FriendList, { rooms: GetAllRoomFragment}, {
    direction: 'forward',
    getConnectionFromProps(props) {
        return props.rooms && props.rooms.allRooms;
    },
    getFragmentVariables(prevVars, totalCount) {
        return {
            ...prevVars,
            count: totalCount,
        };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
        return {
            count,
            cursor,
        };
    },
    query: GetAllRoomPaging,
});