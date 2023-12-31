import { AUTH_LOGOUT } from '../auth/auth.types';
import * as taskTypes from './tasks.types';
let abortController;

/** 
 * * Using 'fetch' instead of 'axios' because when I'm sending error from the backend at
 * * that time axios is not able to catch the response messages with error status codes
 * * like 400 and above codes, but fetch is able get the errors with message and the 
 * * status properly,
 * * But for accessing the status we will get it from the first 'response' and for 
 * * the data we need to do 'response.json()'
 * */

let savedNavigate, savedToastMsg;

/**
 * Pass the boardId for which we need the tasks then it will store 
 * the tasks in task's state for the specific board;
 * */
export const getTasks = (boardId, navigate) => async (dispatch) => {
     savedNavigate = navigate;

     if (!boardId) return;

     dispatch({ type: taskTypes.TASKS_LOADING });

     abortController?.abort();

     abortController = new AbortController();

     try {
          const res = await fetch(`https://kanban-board-app-50he.onrender.com/board/${boardId}`, {
               signal: abortController.signal,
               method: "GET",
               headers: {
                    'authorization': sessionStorage.getItem("TOKEN"),
               }
          })
          const data = await res.json();

          // * IF TOKEN EXPIRED
          if (res.status === 401) {
               dispatch({ type: AUTH_LOGOUT });
               alert(`Session Expired! \n Please Login again.. ${savedNavigate ? savedNavigate('/signin') : window.location.replace('/signin')}`)
               return;
          }

          if (res.ok) {
               dispatch({ type: taskTypes.GET_TASKS_SUCCESS, payload: data })
          } else {
               dispatch({ type: taskTypes.TASKS_ERROR, payload: data.message })
          }
     } catch (error) {
          console.log('error:', error)
          dispatch({ type: taskTypes.TASKS_ERROR, payload: error.message })
     }
}


/**
 * Create Task by passing 'boardId', 'task'. boardId is for creating relationship
 * between board and the task. 
 * 'toastMsg' is optional.
 * */
export const postTask = (boardId, task, toastMsg) => async (dispatch) => {
     if (toastMsg) savedToastMsg = toastMsg;
     else toastMsg = savedToastMsg;

     if (boardId === undefined) {
          toastMsg({
               title: "Can't create Task!",
               desc: "Select a board to create task inside it",
               status: 'warning'
          })
     }

     if (!boardId || !task) return;

     dispatch({ type: taskTypes.TASKS_LOADING })

     try {
          const res = await fetch(`https://kanban-board-app-50he.onrender.com/task/${boardId}`, {
               method: "POST",
               body: JSON.stringify(task),
               headers: {
                    'Content-Type': 'application/json',
                    'authorization': sessionStorage.getItem("TOKEN"),
               }
          })
          const data = await res.json();

          // * IF TOKEN EXPIRED
          if (res.status === 401) {
               dispatch({ type: AUTH_LOGOUT })
               alert(`Session Expired! \n Please Login again.. ${savedNavigate ? savedNavigate('/signin') : window.location.replace('/signin')}`)
               return;
          }

          if (res.ok) {
               dispatch(getTasks(boardId));
          } else {
               dispatch({ type: taskTypes.TASKS_ERROR, payload: data.message })
          }

          toastMsg && toastMsg({
               title: data.message,
               status: res.ok ? 'success' : 'warning'
          })

     } catch (error) {
          console.log('error:', error)
          dispatch({ type: taskTypes.TASKS_ERROR, payload: error.message })
          toastMsg && toastMsg({
               title: error.message,
               status: 'error'
          })
     }

}

/**
 * Pass 'taskId' and 'updates' to update a specific task and taking 
 * 'boardId' to re-call the baord's data after updating the data to
 * show the updated data in dashboard
 * 'toastMsg' is optional
 * */
export const updateTask = (taskId, boardId, updates, toastMsg) => async (dispatch) => {
     if (toastMsg) savedToastMsg = toastMsg;
     else toastMsg = savedToastMsg;

     if (!taskId || !boardId || !updates) return;

     dispatch({ type: taskTypes.TASKS_LOADING });

     try {
          const res = await fetch(`https://kanban-board-app-50he.onrender.com/task/${taskId}`, {
               method: "PATCH",
               body: JSON.stringify(updates),
               headers: {
                    'Content-Type': 'application/json',
                    'authorization': sessionStorage.getItem("TOKEN"),
               }
          })
          const data = await res.json();

          // * IF TOKEN EXPIRED
          if (res.status === 401) {
               dispatch({ type: AUTH_LOGOUT })
               alert(`Session Expired! \n Please Login again.. ${savedNavigate ? savedNavigate('/signin') : window.location.replace('/signin')}`)
               return;
          }

          if (res.ok) {
               dispatch(getTasks(boardId));
          } else {
               dispatch({ type: taskTypes.TASKS_ERROR, payload: data.message });
          }

          toastMsg && toastMsg({
               title: data.message,
               status: res.ok ? 'success' : 'warning'
          })

     } catch (error) {
          console.log('error:', error)
          dispatch({ type: taskTypes.TASKS_ERROR, payload: error.message })
          toastMsg && toastMsg({
               title: error.message,
               status: 'error'
          })
     }
}


/**
 * Pass 'taskId' to delete the specific task
 * taking the 'boardId' to udpate means get the updated data
 * of that specific board after deleting the task.
 * 'toastMsg' is optional.
 * */
export const deleteTask = (taskId, boardId, toastMsg) => async (dispatch) => {
     if (toastMsg) savedToastMsg = toastMsg;
     else toastMsg = savedToastMsg;

     if (!taskId || !boardId) return;

     dispatch({ type: taskTypes.TASKS_LOADING });

     try {
          const res = await fetch(`https://kanban-board-app-50he.onrender.com/task/${taskId}`, {
               method: "DELETE",
               body: JSON.stringify({ boardId }),
               headers: {
                    'Content-Type': 'application/json',
                    'authorization': sessionStorage.getItem("TOKEN"),
               }
          })
          const data = await res.json();

          // * IF TOKEN EXPIRED
          if (res.status === 401) {
               dispatch({ type: AUTH_LOGOUT })
               alert(`Session Expired! \n Please Login again.. ${savedNavigate ? savedNavigate('/signin') : window.location.replace('/signin')}`)
               return;
          }

          if (res.ok) {
               dispatch(getTasks(boardId));
          } else {
               dispatch({ type: taskTypes.TASKS_ERROR, payload: data.message });
          }

          toastMsg && toastMsg({
               title: data.message,
               status: res.ok ? 'success' : 'warning'
          })

     } catch (error) {
          console.log('error:', error)
          dispatch({ type: taskTypes.TASKS_ERROR, payload: error.message })
          toastMsg && toastMsg({
               title: error.message,
               status: 'error'
          })
     }
}


//! ================================ ACTIONS REGARDING SUBTASKS ================================

/**
 * Create Task by passing 'taskId', 'subTask'. taskId is for creating relationship
 * between task and the subTask. 
 * 'toastMsg' is optional.
 * */
export const postSubTask = (taskId, boardId, subTasks, toastMsg) => async (dispatch) => {
     if (toastMsg) savedToastMsg = toastMsg;
     else toastMsg = savedToastMsg;

     if (!taskId || !boardId || !subTasks || !subTasks.length) return;

     dispatch({ type: taskTypes.TASKS_LOADING })

     try {
          const res = await fetch(`https://kanban-board-app-50he.onrender.com/subtask/${taskId}`, {
               method: "POST",
               body: JSON.stringify(subTasks),
               headers: {
                    'Content-Type': 'application/json',
                    'authorization': sessionStorage.getItem("TOKEN"),
               }
          })
          const data = await res.json();

          // * IF TOKEN EXPIRED
          if (res.status === 401) {
               dispatch({ type: AUTH_LOGOUT })
               alert(`Session Expired! \n Please Login again.. ${savedNavigate ? savedNavigate('/signin') : window.location.replace('/signin')}`)
               return;
          }

          if (res.ok) {
               dispatch(getTasks(boardId));
          } else {
               dispatch({ type: taskTypes.TASKS_ERROR, payload: data.message })
          }

          toastMsg && toastMsg({
               title: data.message,
               status: res.ok ? 'success' : 'warning'
          })

     } catch (error) {
          console.log('error:', error)
          dispatch({ type: taskTypes.TASKS_ERROR, payload: error.message })
          toastMsg && toastMsg({
               title: error.message,
               status: 'error'
          })
     }

}

/**
 * Pass 'subTaskId' and 'updates' to update a specific subtask and taking
 * 'boardId' to re-call the baord's data after updating the data to
 * show the updated data in dashboard
 * 'toastMsg' is optional
 * */
export const updateSubTask = (subTaskId, boardId, updates, toastMsg) => async (dispatch) => {
     if (toastMsg) savedToastMsg = toastMsg;
     else toastMsg = savedToastMsg;

     if (!subTaskId || !boardId || !updates) return;

     dispatch({ type: taskTypes.TASKS_LOADING });

     try {
          const res = await fetch(`https://kanban-board-app-50he.onrender.com/subtask/${subTaskId}`, {
               method: "PATCH",
               body: JSON.stringify(updates),
               headers: {
                    'Content-Type': 'application/json',
                    'authorization': sessionStorage.getItem("TOKEN"),
               }
          })
          const data = await res.json();

          // * IF TOKEN EXPIRED
          if (res.status === 401) {
               dispatch({ type: AUTH_LOGOUT })
               alert(`Session Expired! \n Please Login again.. ${savedNavigate ? savedNavigate('/signin') : window.location.replace('/signin')}`)
               return;
          }

          if (res.ok) {
               dispatch(getTasks(boardId));
          } else {
               dispatch({ type: taskTypes.TASKS_ERROR, payload: data.message });
          }

          toastMsg && toastMsg({
               title: data.message,
               status: res.ok ? 'success' : 'warning'
          })

     } catch (error) {
          console.log('error:', error)
          dispatch({ type: taskTypes.TASKS_ERROR, payload: error.message })
          toastMsg && toastMsg({
               title: error.message,
               status: 'error'
          })
     }
}


/**
 * Pass 'subTaskId' to delete the specific task, 'taskId' to
 * remove the reference of this subTask in the task and
 * taking the 'boardId' to udpate means get the updated data
 * of that specific board after deleting the task.
 * 'toastMsg' is optional.
 * */
export const deleteSubTask = (subTaskId, taskId, boardId, toastMsg) => async (dispatch) => {
     if (toastMsg) savedToastMsg = toastMsg;
     else toastMsg = savedToastMsg;

     if (!subTaskId || !taskId || !boardId) return;

     dispatch({ type: taskTypes.TASKS_LOADING });

     try {
          const res = await fetch(`https://kanban-board-app-50he.onrender.com/subtask/${subTaskId}`, {
               method: "DELETE",
               body: JSON.stringify({ taskId }),
               headers: {
                    'Content-Type': 'application/json',
                    'authorization': sessionStorage.getItem("TOKEN"),
               }
          })
          const data = await res.json();

          // * IF TOKEN EXPIRED
          if (res.status === 401) {
               dispatch({ type: AUTH_LOGOUT })
               alert(`Session Expired! \n Please Login again.. ${savedNavigate ? savedNavigate('/signin') : window.location.replace('/signin')}`)
               return;
          }

          if (res.ok) {
               dispatch(getTasks(boardId));
          } else {
               dispatch({ type: taskTypes.TASKS_ERROR, payload: data.message });
          }

          toastMsg && toastMsg({
               title: data.message,
               status: res.ok ? 'success' : 'warning'
          })

     } catch (error) {
          console.log('error:', error)
          dispatch({ type: taskTypes.TASKS_ERROR, payload: error.message })
          toastMsg && toastMsg({
               title: error.message,
               status: 'error'
          })
     }
}