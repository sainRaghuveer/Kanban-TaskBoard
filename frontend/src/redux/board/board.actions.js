import * as boardTypes from './board.types';
import { AUTH_LOGOUT } from '../auth/auth.types';
import { DELETE_TASKS } from '../tasks/tasks.types';


/** 
 * * Using 'fetch' instead of 'axios' because when I'm sending error from the backend at
 * * that time axios is not able to catch the response messages with error status codes
 * * like 400 and above codes, but fetch is able get the errors with message and the 
 * * status properly,
 * * But for accessing the status we will get it from the first 'response' and for 
 * * the data we need to do 'response.json()'
 * */

let savedNavigate;

// Get Boards names based on the logged-in user
export const getBoards = (navigate) => async (dispatch) => {
     savedNavigate = navigate;

     dispatch({ type: boardTypes.BOARD_LOADING })

     try {
          const res = await fetch(`https://kanban-board-app-50he.onrender.com/board`, {
               method: 'GET',
               headers: {
                    'authorization': sessionStorage.getItem("TOKEN"),
               }
          });
          const data = await res.json();

          if (res.ok) {
               dispatch({ type: boardTypes.GET_BOARD_SUCCESS, payload: data })
          } else {
               dispatch({ type: boardTypes.BOARD_ERROR, payload: data.message })
          }

          // * IF TOKEN EXPIRED
          if (res.status === 401) {
               dispatch({ type: AUTH_LOGOUT });
               alert(`Session Expired! \n Please Login again.. ${savedNavigate ? savedNavigate('/signin') : window.location.replace('/signin')}`);
               return;
          }
     } catch (error) {
          console.log('error:', error)
          dispatch({ type: boardTypes.BOARD_ERROR, payload: error.message })
     }
}


// Create Board
export const createBoard = (boardName) => async (dispatch) => {
     if (!boardName) return;

     dispatch({ type: boardTypes.BOARD_LOADING });

     try {
          const res = await fetch(`https://kanban-board-app-50he.onrender.com/board`, {
               method: 'POST',
               body: JSON.stringify({ name: boardName }),
               headers: {
                    'Content-Type': 'application/json',
                    'authorization': sessionStorage.getItem("TOKEN"),
               }
          })
          const data = await res.json();

          if (res.ok) {
               dispatch(getBoards())
          } else {
               dispatch({ type: boardTypes.BOARD_ERROR, payload: data.message })
          }

          // * IF TOKEN EXPIRED
          if (res.status === 401) {
               dispatch({ type: AUTH_LOGOUT });
               alert(`Session Expired! \n Please Login again.. ${savedNavigate ? savedNavigate('/signin') : window.location.replace('/signin')}`);
               return;
          }
     } catch (error) {
          console.log('error:', error)
          dispatch({ type: boardTypes.BOARD_ERROR, payload: error.message })
     }
}


// Patch Boards
export const editBoard = (boardId, boardName) => async (dispatch) => {

     if (!boardId || !boardName) return;

     dispatch({ type: boardTypes.BOARD_LOADING });

     try {
          const res = await fetch(`https://kanban-board-app-50he.onrender.com/board/${boardId}`, {
               method: 'PATCH',
               body: JSON.stringify({ name: boardName }),
               headers: {
                    'Content-Type': 'application/json',
                    'authorization': sessionStorage.getItem("TOKEN"),
               }
          })
          const data = await res.json();

          if (res.ok) {
               dispatch(getBoards());
          } else {
               dispatch({ type: boardTypes.BOARD_ERROR, payload: data.message })
          }

          // * IF TOKEN EXPIRED
          if (res.status === 401) {
               dispatch({ type: AUTH_LOGOUT })
               alert(`Session Expired! \n Please Login again.. ${savedNavigate ? savedNavigate('/signin') : window.location.replace('/signin')}`)
               return;
          }
     } catch (error) {
          console.log('error:', error)
          dispatch({ type: boardTypes.BOARD_ERROR, payload: error.message })
     }
}

// Delete Board
export const deleteBoard = (boardId) => async (dispatch) => {
     if (!boardId) return;

     dispatch({ type: boardTypes.BOARD_LOADING });

     try {
          const res = await fetch(`https://kanban-board-app-50he.onrender.com/board/${boardId}`, {
               method: 'DELETE',
               headers: {
                    'authorization': sessionStorage.getItem("TOKEN"),
               }
          })
          const data = await res.json();

          if (res.ok) {
               dispatch({ type: DELETE_TASKS });
               dispatch(getBoards());
          } else {
               dispatch({ type: boardTypes.BOARD_ERROR, payload: data.message });
          }

          // * IF TOKEN EXPIRED
          if (res.status === 401) {
               dispatch({ type: AUTH_LOGOUT })
               alert(`Session Expired! \n Please Login again.. ${savedNavigate ? savedNavigate('/signin') : window.location.replace('/signin')}`)
               return;
          }
     } catch (error) {
          console.log('error:', error)
          dispatch({ type: boardTypes.BOARD_ERROR, payload: error.message });
     }
}