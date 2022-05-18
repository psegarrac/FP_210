import Room from "./Room";
import LocalStorage from "./utils";
import { io } from "socket.io-client";
import { getRooms } from "../../services/rooms";
import { getSingleGame } from "../../services/games";
class Dashboard {
  roomsList = [];
  localStorage = new LocalStorage();
  avatarMobile;
  socket = io();
  me = null;

  constructor(initData) {
    this.boxRooms = initData.boxRooms;
  }

  init() {
    const me = this.localStorage.getLocalStorage("me", "session");
    this.me = me;
    this.socket.emit("connectedToDashboard", me);

    this.redirectToLogin();
    this.generateRooms();
    this.generatePlayerBox();
    this.generateLogout();
    this.avatarMobile = document.querySelector("#avatarMobile");
    avatarMobile.addEventListener(
      "dragstart",
      this.dragIniciado.bind(this),
      false
    );
    avatarMobile.addEventListener(
      "dragend",
      this.dragFinalizado.bind(this),
      false
    );

    this.reconnect();
  }

  dragIniciado(e) {
    e.dataTransfer.setData("userAvatar", "avatarMobile");
  }

  dragFinalizado() {}

  generateRooms() {
    this.boxRooms.forEach((box, index) => {
      const roomName = `Room ${index + 1}`;
      // Generamos las instancias de las salas
      this.roomsList[index] = new Room(box.id, roomName, 4, this.socket);
      // Iniciamos listeners para eventos del tipo storage
      this.roomsList[index].initSocketEvents();
      this.roomsList[index].initDragListeners();

      const boxDiv = document.getElementById(box.id);

      // Añadir clase para pintar caja
      boxDiv.classList.add(`room${index + 1}`);
      // Añadir títulos
      const boxDivHeader = document.querySelector(
        `#${box.id} .m-room-drop-item__header h3`
      );
      boxDivHeader.innerHTML = roomName;
    });

    this.generateStorageRooms();
  }

  generateStorageRooms() {
    const roomsData = this.roomsList.map((room) => ({
      id: room.id,
      usersRoom: [],
      isOpen: true,
      game: {
        grid: [],
        players: [],
        defeatedPlaters: [],
        totalCellsToWin: 0,
        round: {
          turn: 0,
          roundNumber: 0,
          player: null,
        },
      },
    }));

    this.socket.emit("generate_rooms_data", roomsData);
  }

  generatePlayerBox() {
    const data = this.localStorage.getLocalStorage("me", "session");

    if (data) {
      const player = data;
      const boxDiv = document.getElementById("my-user-box");
      const avatarDiv = boxDiv.querySelector(".a-avatar");
      const nameDiv = boxDiv.querySelector(".m-user-item__name");
      const roomDiv = boxDiv.querySelector(".m-user-item__room");
      const roomName = this.getRoomName(player.favouriteRoom);

      nameDiv.innerText = player.name;
      roomDiv.innerText = roomName;
      avatarDiv.dataset.id = player.id;
      avatarDiv.dataset.avatar = player.avatar;
      avatarDiv.dataset.color = player.color;
      avatarDiv.classList.add(player.avatar);

      if (this.isPlayerInRooms(player)) {
        avatarDiv.classList.add("hidden");
      } else {
        avatarDiv.classList.remove("hidden");
      }
    }
  }

  generateLogout() {
    const logoutBtn = document.getElementById("logout");
    const user = this.localStorage.getLocalStorage("me", "session");

    logoutBtn.addEventListener("click", async () => {
      let targetRoom = null;
      let exitUser = null;
      this.roomsList.forEach((room) => {
        const currentRoomPlayers = room.players;
        const userInRoom = currentRoomPlayers.find(
          (player) => player.id === user.id
        );
        if (userInRoom) {
          targetRoom = room;
          exitUser = userInRoom;
        }
      });
      if (targetRoom) {
        await targetRoom.logOut(exitUser);
      } else {
        this.localStorage.setLocalStorage("me", null, "session");
        this.redirectToLogin();
      }
    });
  }

  isPlayerInRooms(player) {
    let allPlayers = [];
    this.roomsList.forEach((room) => {
      allPlayers.concat(room.players);
    });
    return !!allPlayers.find((pl) => pl.id === player.id);
  }

  getRoomName(id) {
    let index = -1;
    this.boxRooms.find(function (item, i) {
      if (item.id === id) {
        index = i;
        return i;
      }
    });
    return "ROOM " + (index + 1);
  }

  redirectToLogin() {
    let user = this.localStorage.getLocalStorage("me", "session");
    if (!user) {
      window.location.href = "/";
    }
  }

  async reconnect() {
    try {
      let rooms = await getRooms();
      const userWasInRoom = rooms.find((room) => {
        const currentUsersInRoom = room.usersRoom.find(
          (user) => user.id === this.me.id
        );
        if (currentUsersInRoom) return room;
      });

      if (userWasInRoom) {
        const targetRoom = this.roomsList.find(
          (room) => room.id === userWasInRoom.id
        );
        targetRoom.addToRoom(this.me);
        document.querySelector(".m-user-item__image .image").innerHTML = "";

        //! PENDIENTE DE IMPLEMENTAR PARA REENGANCHAR AL USUARIO AL JUEGO EN CASO DE REFRESH

        //Is in game
        // let game = await getSingleGame({ roomId: userWasInRoom.id });
      }
    } catch (error) {}
  }
}

export default Dashboard;
