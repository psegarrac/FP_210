//https://dev.to/mikefmeyer/build-a-node-js-express-rest-api-with-mongodb-and-swagger-3de9

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const bcryptSalt = 10;
const status = require("http-status");
const { ErrorHandler } = require("../helpers/error");
const Room = require("../models/room");
const { MAX_BY_ROOM } = require("../contants/rooms");
const Game = require("../models/Game2");
const { getRooms } = require("../services/rooms");

//SCHEMAS

/**
 * @swagger
 *  components:
 *    definitions:
 *      Player:
 *        properties:
 *          id:
 *            type: string
 *          name:
 *            type: string
 *          cellsConquered:
 *            type: number
 *          color:
 *            type: string
 *          hasLost:
 *            type: boolean
 *            default: false
 *
 *      RankingStatus:
 *        properties:
 *          cellsConquered:
 *            type: number
 *          wins:
 *            type: number
 *
 *    schemas:
 *      Game:
 *        type: object
 *        properties:
 *          roomId:
 *            type: string
 *          grid:
 *            type: array
 *            items:
 *              type: object
 *              properties:
 *                id:
 *                  type: string
 *                row:
 *                  type: number
 *                cell:
 *                  type: number
 *                cell_x:
 *                  type: number
 *                cell_y:
 *                  type: number
 *                playerId:
 *                  type: string
 *                  default: null
 *                color:
 *                  type: string
 *                  default: null
 *          players:
 *            type: array
 *            items:
 *              $ref: '#/components/definitions/Player'
 *          defeatedPlayers:
 *            type: array
 *            items:
 *              type: object
 *              properties:
 *                id:
 *                  type: string
 *                name:
 *                  type: string
 *                cellsConquered:
 *                  type: number
 *          totalCellsToWin:
 *            type: number
 *          round:
 *            type: object
 *            properties:
 *              turn:
 *                type: number
 *              roundNumber:
 *                type: number
 *              player:
 *                type: object
 *                $ref: '#components/definitions/Player'
 *
 *      User:
 *        type: object
 *        properties:
 *          id:
 *            type: string
 *          name:
 *            type: string
 *          email:
 *            type: string
 *          password:
 *            type: string
 *          avatar:
 *            type: string
 *          favouriteRoom:
 *            type: string
 *          color:
 *            type: string
 *          rankingStatus:
 *            $ref: '#components/definitions/RankingStatus'
 *
 *      Room:
 *        type: object
 *        properties:
 *          id:
 *            type: string
 *          name:
 *            type: string
 *          color:
 *            type: string
 *          usersRoom:
 *            type: array
 *            items:
 *              type: object
 *              properties:
 *                id:
 *                  type: string
 *                name:
 *                  type: string
 *                avatar:
 *                  type: string
 *                rankingStatus:
 *                  $ref: '#components/definitions/RankingStatus'
 *          isOpne:
 *            type: boolean
 *            default: true
 */

// USER
/**
 * @swagger
 * /api/users:
 *   get:
 *     description: All users
 *     responses:
 *       200:
 *         description: Devuelve todos los users
 *         schema:
 *           type: array
 *           items:
 *            $ref: '#components/schemas/User'
 *
 *       404:
 *         description: User not found
 *         schema:
 *           type: object
 *           properties:
 *              status:
 *                type: string,
 *                default: "error"
 *              statusCode:
 *                type: number
 *                default: 404
 *              messaje:
 *                type: string
 */

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      throw new ErrorHandler(status.NOT_FOUND, "No existen usuarios");
    }
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The user ID.
 *     description: Get a user by id
 *     responses:
 *       200:
 *         description: Devuelve el usuario
 *         schema:
 *           $ref: '#components/schemas/User'
 *       404:
 *         description: User not found
 *         schema:
 *           type: object
 *           properties:
 *              status:
 *                type: string,
 *                default: "error"
 *              statusCode:
 *                type: number
 *                default: 404
 *              messaje:
 *                type: string
 */

router.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (user) {
      res.status(200).json({
        code: "ok",
        message: "Success",
        data: user,
      });
    } else {
      throw new ErrorHandler(status.NOT_FOUND, "User not found");
    }
  } catch (error) {
    next(error);
  }
});


// AUTH
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     parameters:
 *      - in: body
 *        name: userData
 *        description: Login user
 *        schema:
 *          type: object
 *          properties:
 *            email:
 *              type: string
 *            password:
 *              type: string
 *     responses:
 *       200:
 *         description: Login success
 *         schema:
 *            $ref: '#components/schemas/User'
 *       400:
 *         description: Password is not correct
 *         schema:
 *           type: object
 *           properties:
 *              status:
 *                type: string,
 *                default: "error"
 *              statusCode:
 *                type: number
 *                default: 400
 *              messaje:
 *                type: string
 *       404:
 *         description: User not found
 *         schema:
 *           type: object
 *           properties:
 *              status:
 *                type: string,
 *                default: "error"
 *              statusCode:
 *                type: number
 *                default: 404
 *              messaje:
 *                type: string
 */
router.post("/auth/login", async (req, res, next) => {
  const userData = req.body;
  const userFromDb = await User.findOne({ email: userData.email });

  try {
    if (!userFromDb) {
      throw new ErrorHandler(status.NOT_FOUND, "El usuario no existe");
    }

    if (bcrypt.compareSync(userData.password, userFromDb.password)) {
      res.status(200).send(userFromDb);
    } else {
      throw new ErrorHandler(status.BAD_REQUEST, "El password no es correcto");
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     parameters:
 *      - in: body
 *        name: userData
 *        description: Register new user
 *        schema:
 *          type: object
 *          properties:
 *            email:
 *              type: string
 *            password:
 *              type: string
 *     responses:
 *       200:
 *         description: Register success
 *         schema:
 *          $ref: '#components/schemas/User'
 *
 *       404:
 *         description: User not found
 *         schema:
 *           type: object
 *           properties:
 *              status:
 *                type: string,
 *                default: "error"
 *              statusCode:
 *                type: number
 *                default: 404
 *              messaje:
 *                type: string
 */
router.post("/auth/register", async (req, res, next) => {
  const userData = req.body;
  // encriptamos password usuario para la BD
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(userData.password, salt);
  userData.password = hashPass;
  try {
    const userFromDb = await User.findOne({ email: userData.email });
    if (userFromDb) {
      throw new ErrorHandler(status.CONFLICT, "El usuario existe");
    }
    const user = new User(userData);
    const saveUser = await user.save();
    if (saveUser) {
      res.status(200).send(saveUser);
    }
  } catch (error) {
    next(error);
  }
});

/////////////////////////////////////////////////////////////
// ROOMS

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     description: All rooms
 *     responses:
 *       200:
 *         description: Returns all the rooms
 *         schema:
 *           type: array
 *           items:
 *            $ref: '#components/schemas/Room'
 */
router.get("/rooms", async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/rooms/addUser:
 *   post:
 *     parameters:
 *      - in: body
 *        name: data
 *        description: New user
 *        schema:
 *          type: object
 *          properties:
 *            email:
 *              type: string
 *            password:
 *              type: string
 *     responses:
 *       200:
 *         description: Register success
 *         schema:
 *           type: object
 *           properties:
 *            code:
 *              type: string,
 *              default: "ok"
 *            message:
 *              type: string
 *            data:
 *              type: object
 *              properties:
 *                usersRoom:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schema/User'
 *                isOpen:
 *                  type: boolean
 *       409:
 *         description: Devuelve mensaje "La sala está cerrada"
 *         schema:
 *           type: object
 *           properties:
 *              status:
 *                type: string,
 *                default: "error"
 *              statusCode:
 *                type: number
 *                default: 409
 *              messaje:
 *                type: string
 */
router.post("/rooms/addUser", async (req, res, next) => {
  const data = req.body;
  try {
    const newPlayer = data.newPlayer;
    const currentRoom = await Room.findOne({ id: data.roomId });
    let users = currentRoom.usersRoom;
    const isFullRoom = currentRoom.usersRoom.length === MAX_BY_ROOM;
    let currentUsers = currentRoom.usersRoom.length;
    const find = { id: data.roomId };
    const update = { $push: { usersRoom: newPlayer } };

    if (!isFullRoom) {
      await Room.findOneAndUpdate(find, update);
      currentUsers++;
      users.push(newPlayer);

      res.status(200).send({
        code: "ok",
        message: "Success",
        data: {
          usersRoom: users,
          isOpen: currentUsers === MAX_BY_ROOM ? false : true,
        },
      });
    } else {
      await Room.findOneAndUpdate(find, { isOpen: false });
      throw new ErrorHandler(status.CONFLICT, "Room is closed");
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/rooms/deleteUser/{id}:
 *   get:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The room ID.
 *     description: Get a room by id
 *     responses:
 *       200:
 *         description: Returns rest users
 *         schema:
 *          type: object
 *          properties:
 *            code:
 *              type: string,
 *              default: "ok"
 *            message:
 *              type: string
 *            data:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/User'
 *
 */
router.delete("/rooms/deleteUser/:playerId", async (req, res, next) => {
  const playerId = req.params.playerId;
  try {
    let rooms = await getRooms();
    const room = rooms.find((room) => {
      const existPlayer = room.usersRoom.find((user) => user.id === playerId);
      if (existPlayer) {
        return room;
      }
    });
    const find = { id: room.id };
    const players = room.usersRoom;
    const deletedPlayer = players.find((player) => player.id === playerId);
    const newPlayers = players.filter((player) => player.id !== playerId);
    const update = { $set: { usersRoom: newPlayers } };
    await Room.findOneAndUpdate(find, update);

    res.status(200).send({
      code: "ok",
      message: `El jugador ${deletedPlayer.name} ha salido de la sala`,
      data: newPlayers,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The room ID.
 *     description: Get a room by id
 *     responses:
 *       200:
 *         description: Returns the requested room
 *         schema:
 *            $ref: '#components/schemas/Room'
 */
router.get("/rooms/:id", async (req, res, next) => {
  try {
    const currentRoom = await Room.findOne({ id: req.params.id });
    if (currentRoom) {
      res.status(200).send({
        code: "ok",
        message: "Success",
        data: currentRoom,
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/rooms/{id}/clearRoom:
 *   patch:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The user ID.
 *     responses:
 *       200:
 *         description: Clear the users of the room
 */
router.put("/rooms/:id/clearRoom", async (req, res, next) => {
  try {
    const find = { roomId: req.params.id };
    const update = { $set: { usersRoom: [] } };
    await Room.findOneAndUpdate(find, update);

    res.status(200).send({
      code: "ok",
      message: `La sala esta disponible`,
    });
  } catch (error) {
    next(error);
  }
});




router.get("/games/:roomId", async (req, res, next) => {
  try {
    const game = await Game.findOne({ roomId: req.params.roomId });

    if (game) {
      res.status(200).json({
        code: "ok",
        message: "Success",
        data: game,
      });
    } else {
      throw new ErrorHandler(status.NOT_FOUND, "Game is not found");
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/games/create:
 *   post:
 *     parameters:
 *      - in: body
 *        name: userData
 *        description: Create new game
 *        schema:
 *          $ref: '#/components/schemas/Game'
 *
 *     responses:
 *       200:
 *         description: New Game created
 */
router.post("/games/create", async (req, res, next) => {
  const data = req.body;
  try {
    const newGame = data.initNewGameToStorage;
    const roomId = data.roomId;
    const game = new Game({ roomId, ...newGame });
    await game.save();
    res.status(200).send({
      code: "ok",
      message: "Success",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/games/{id}/updateGame:
 *   patch:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The room ID.
 *      - in: body
 *        name: game
 *        description: Update game
 *        schema:
 *          $ref: '#components/schemas/Game'
 *     responses:
 *       200:
 *         description: Game updated
 *
 */
router.put("/games/:id/updateGame", async (req, res, next) => {
  const data = req.body;

  try {
    await Game.findOneAndUpdate(
      { roomId: req.params.id },
      {
        $set: {
          defeatedPlayers: data.defeatedPlayers,
          grid: data.grid,
          players: data.players,
          round: data.round,
          totalCellsToWin: data.totalCellsToWin,
        },
      }
    );

    res.status(200).json({
      code: "ok",
      message: "Success",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/games/{id}:
 *   delete:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        type: string
 *        description: The room ID.
 *     description: Delete a games by room id
 *     responses:
 *       200:
 *         description: Success
 */

router.delete("/games/:id", async (req, res, next) => {
  try {
    await Game.deleteMany({ roomId: req.params.id });
    res.status(200).json({
      code: "ok",
      message: "Success",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
