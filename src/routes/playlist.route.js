import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistBYId, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const playlistRouter = Router()

playlistRouter.route('/createPlaylist').post(verifyJWT, createPlaylist)
playlistRouter.route('/getPlaylist/p/:playlistId').get(getPlaylistBYId)
playlistRouter.route('/addVideo/p/:playlistId').post(verifyJWT, addVideoToPlaylist)
playlistRouter.route('/removeVideo/p/:playlistId/v/:videoId').post(verifyJWT, removeVideoFromPlaylist)
playlistRouter.route('/getUserPlaylists/u/:userId').get(getUserPlaylists)
playlistRouter.route('/deletePlaylist/p/:playlistId').post(verifyJWT, deletePlaylist)
playlistRouter.route('/updatePlaylist/p/:playlistId').post(verifyJWT, updatePlaylist)

export default playlistRouter