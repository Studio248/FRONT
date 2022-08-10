/**
 * Jack
 * 
 * Login이 필요하지 않은 페이지 (ex. Login페이지)의 경우
 * 페이지 접근시 바로 /lobby로 이동하도록 NotRequireAuth 생성
 * 
 * 반대로 Login이 필요한 페이지의 경우 로그인 상태 확인 후
 * / (Main) 페이지로 이동하도록 함
 * => 로그인시 접근했던 페이지로 자동 이동됨
 */

import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserId, setProfileImg } from "../store";
import Ingame from '../components/Ingame'
import axios from "axios";
import { paddr, reqHeaders } from "../proxyAddr";

// 로그인 불필요한 페이지 (Login 되어있는 상태로 login 시도한 경우 lobby로 바로 이동)
const NotRequireAuth = ({ children }) => {
    const [ authenticated, setAuth ] = useState(null);
    const dispatch = useDispatch();

    // authenticate 여부에 따른 렌더링 분기
    const ret = {null: <></>, true:<Navigate to='/lobby' />, false: children}

    useEffect(() => {
        // 마운트시 서버로 요청 보내 세션 유효여부 확인
        axios.get(`${paddr}api/auth`, reqHeaders)
        .then((res)=>{
            // 로그인 되어있어서 로그인된 유저 정보가 넘어온다면 redux에 userid와 profile_img를 세팅
            dispatch(setUserId(res.data.user?.userid));
            dispatch(setProfileImg("/img/" + res.data.user?.profile_img));
            setAuth(res.data.auth);
        })
        .catch((e)=>{
            console.log("login 확인 error", e);
        });
    }, []);
    return ret[authenticated];
};

// 로그인이 필요한 페이지 접근시
const RequireAuth = ({ Component }) => {
    const [ authenticated, setAuth ] = useState(null);
    const params = useParams();
    const location = useLocation();
    const dispatch = useDispatch();

    // authenticate 여부에 따른 렌더링 분기
    const ret = {null: <></>, true: (Component == Ingame? <Component roomId={params.roomId}/> :<Component />), false: <Navigate to="/" />}

    useEffect(() => {
        // 마운트시 서버로 요청 보내 세션 유효여부 확인
        axios.get(`${paddr}api/auth`, reqHeaders)
        .then((res)=>{
            // 로그인 되어있어서 로그인된 유저 정보가 넘어온다면 redux에 userid와 profile_img를 세팅
            dispatch(setUserId(res.data.user?.userid));
            dispatch(setProfileImg("/img/" + res.data.user?.profile_img));
            setAuth(res.data.auth);
        })
        .catch((e)=>{
            console.log("login 확인 error", e);
        });
    }, []);
    
    // Ingame 컴포넌트인 경우 roomId를 넘겨줌
    return ret[authenticated];
    
};
export { RequireAuth, NotRequireAuth };