import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useInRouterContext } from 'react-router-dom';
import styled from 'styled-components';
import Rank from './Rank';
import Citizen from './Citizen';
import Setting from './Setting';
import axios from 'axios';
import { setUserId, FriendInfoSet, FriendInfoChange, FriendInfoReset } from '../store';
import { useDispatch, useSelector } from 'react-redux';
import connectSocket, {socket} from '../script/socket';
import io from 'socket.io-client';
import style from '../css/Lobby.module.css'
import { Container } from 'react-bootstrap';


const Lobby = () => {

    
    const myId = useSelector(state => state.user.id);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const btnStart = () => {
        socket && socket.emit("checkEnterableRoom", (roomNumber)=>{
            console.log(`로비에서 ${roomNumber}`);
            navigate(`/ingame/${roomNumber}`);});
    };
    const btnMake = () => {
        console.log("make button");
    };
    const btnLogout = ()=>{
        axios.post('/api/auth/logout').finally(()=>{
            socket.emit('loginoutAlert', myId, 0);
            dispatch(setUserId(""));
            // dispatch(FriendInfoReset(""));
            // socket.close();
            sessionStorage.removeItem('userid');
            navigate('/');
        });
    };


    let img = "";
    let [imgURL, imgURLstate] = useState("");

    // const test = useSelector((FriendInfo) => FriendInfo.FriendInfo);

    // console.log('리덕스 친구리스트', test);
    
    useEffect(() => {

        // console.log("useeffect:", socket);
        
        !socket && connectSocket().then(() => {
            socket.on("friendList", (userid, status) => {
                console.log("friend수정확인",userid, status)
                dispatch(FriendInfoChange([userid, status]));
            })
            socket.emit("userinfo", myId);
            socket.emit('loginoutAlert', myId, 1);
            console.log('login 변경사항 확인')
        })
        
        // profile 이미지 정보
        axios.get('api/lobby/userimg')
        .then(res => { 
            img = res.data[0][0].profile_img;
            imgURLstate("/img/" + img)
        })
        .catch(()=>{
            console.log('실패함')
        })

        axios.post('/api/lobby/friendinfo', {userid: myId})
            .then((res) => {
                let FriList = res.data[0]; // user의 전체 친구 목록
                let onlineList = res.data[1]; // 현재 접속중인 user 목록
                console.log('onlinelist', onlineList);
                onlineList = { testid : 1,  jack: 1}; // 임시 접속 user 목록
                for (var i = 0; i < Object.keys(FriList).length; i++){
                    let key = FriList[i].userid;
                    if (!onlineList[key]){
                        dispatch(FriendInfoSet([key, 0]))
                    } else {
                        dispatch(FriendInfoSet([key, 1]))
                    }
                }
            })
            .catch((e) => {
                console.log(e);
            })
        
    }, [])


    return (
        <div id="lobby" style={{padding:"2em"}}>
            여기는 로비
            
            <div className={style.MainLobby}>
 
                <div className={style.MainLobbyHeader}>

                    <img className={style.HeaderLogo} src='/img/mainLogo.png'>
                    </img>
                    <div className={style.HeaderImage}>
                    <img src={imgURL} className={style.test}>
                    </img>
                    </div>

                    <div className={style.Headername}>
                        해인이
                    </div>

                    <div className={style.HeaderIngameButton}>

                        <button className={style.IngameButton} onClick={btnStart}><span>Start</span></button>
                        <button className={style.IngameButton} onClick={btnMake}><span>Make a game</span></button>

                    </div>

                </div>

                <div className={style.MainLobbyContent}>
                    <div className={style.MainLobbyTap}>
                    
                        {/* <button id="rank" className={style.TapButton} onClick={() => {tapChange(0)}}>RANKING</button>
                        <button id="citizen" className={style.TapButton} onClick={() => {tapChange(1)}}>CITIZEN</button>
                        <button id="citizen" className={style.TapButton} onClick={() => {tapChange(2)}}>Setting</button> */}
                        <Link to="/lobby/">
                        <button id="rank">RANKING</button>
                        </Link>
                        <Link to="/lobby/citizen">
                        <button id="citizen">CITIZEN</button>
                        </Link>
                        <Link to="/lobby/setting">
                        <button id="setting">SETTING</button>
                        </Link>
                        <button id="logout" onClick={btnLogout}>LOGOUT</button>
                    
                    </div>

                    <div className={style.MainLobbyTapContents}>
                        <Routes>
                            <Route path="/" element={<Rank/>}/>
                            <Route path="citizen" element={<Citizen/>}/>
                            <Route path="setting" element={<Setting/>}/>
                        </Routes>
                    </div>

                </div>

            </div>

            {/* <div className={style.flexbox2}>
            
                <div className={style.item11}>aelfjhawbefljhawebflh</div>
                <div className={style.item22}>aelfjhawbefljhawebflh</div>
                
            </div> */}
            
            
        </div>
    );
}

export default Lobby;