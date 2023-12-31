import * as authTypes from './auth.types';

let savedNavigate, savedToastMsg;
/** 
 * * Using 'fetch' instead of 'axios' because when I'm sending error from the backend at
 * * that time axios is not able to catch the response messages with error status codes
 * * like 400 and above codes, but fetch is able get the errors with message and the 
 * * status properly,
 * * But for accessing the status we will get it from the first 'response' and for 
 * * the data we need to do 'response.json()'
 * */



/**
 * In 'cred' we're passing an Object with 'username', 'email', and 'password' key with 
 * proper values and 
 * 'navigate' for naviagting the user to the 'sign-in' page
 * In the 'toastMsg' we're passing the returned function by the 'useToastMsg' custom-hook
 * */

export const signin = (cred, navigate, toastMsg) => async (dispatch) => {
     if (toastMsg) savedToastMsg = toastMsg;
     else toastMsg = savedToastMsg;

     if (navigate) savedNavigate = navigate;
     else navigate = savedNavigate;


     if (!cred.email || !cred.password) return;

     dispatch({ type: authTypes.AUTH_LOADING });

     try {
          const res = await fetch(`https://kanban-board-app-50he.onrender.com/signin`, {
               method: 'POST',
               body: JSON.stringify(cred),
               headers: {
                    'Content-Type': 'application/json'
               }
          });

          const data = await res.json();

          // * IF TOKEN EXPIRED
          if (res.status === 401) {
               dispatch({ type: authTypes.AUTH_LOGOUT })
               alert(`Session Expired! \n Please Login again.. ${navigate ? navigate('/signin') : window.location.replace('/signin')}`)
               return;
          }

          if (res.ok) {
               dispatch({ type: authTypes.AUTH_LOGIN_SUCCESS, payload: data.user });
               navigate('/');
          } else {
               dispatch({ type: authTypes.AUTH_ERROR });
          }

          toastMsg({
               title: data.message,
               status: res.ok ? 'success' : 'warning',
          });

     } catch (error) {
          console.log('error:', error);
          dispatch({ type: authTypes.AUTH_ERROR });
          toastMsg({
               title: error.message,
               status: 'error'
          });
     }
}


/**
 * In 'cred' we're passing an Object with 'username', 'email', and 'password' key with 
 * proper values and 
 * 'navigate' for naviagting the user to the 'sign-up' page
 * In the 'toastMsg' we're passing the returned function by the 'useToastMsg' custom-hook
 * */
export const signup = (cred, navigate, toastMsg) => async (dispatch) => {
     if (toastMsg) savedToastMsg = toastMsg;
     else toastMsg = savedToastMsg;

     if (navigate) savedNavigate = navigate;
     else navigate = savedNavigate;

     if (!cred.username || !cred.email || !cred.password) return;

     // ? EMAIL VERIFIER
     if (!cred.email.includes('@') || !cred.email.includes('mail')) {
          toastMsg({
               title: 'Enter a valid email address!',
               status: 'warning'
          })
          return;
     };
     // ? PASSWORD VERIFIER
     if (cred.password.length <= 5) {
          toastMsg({
               title: 'Password must contain more than 5 char!',
               status: 'warning'
          });
          return;
     }

     dispatch({ type: authTypes.AUTH_LOADING });

     try {
          const res = await fetch(`https://kanban-board-app-50he.onrender.com/signup`, {
               method: "POST",
               body: JSON.stringify(cred),
               headers: {
                    'Content-Type': 'application/json'
               }
          });

          const data = await res.json();


          // * IF TOKEN EXPIRED
          if (res.status === 401) {
               dispatch({ type: authTypes.AUTH_LOGOUT })
               alert(`Session Expired! \n Please Login again.. ${navigate ? navigate('/signin') : window.location.replace('/signin')}`)
               return;
          };

          if (res.ok) navigate('/signin');
          dispatch({ type: res.ok ? authTypes.AUTH_SUCCESS : authTypes.AUTH_ERROR });

          toastMsg({
               title: data.message,
               status: res.ok ? 'success' : 'warning',
          });
     } catch (error) {
          console.log('error:', error);
          dispatch({ type: authTypes.AUTH_ERROR })
          toastMsg({
               title: error.message,
               status: 'error'
          });
     }
}