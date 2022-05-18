import { loginInUser } from "../../services/users";
import LocalStorage from "./utils";
class Login {
  fields = {};
  errors = {};
  storage = new LocalStorage();

  constructor(loginFields) {
    this.form = document.getElementById(loginFields.formId);
    this.emailInput = document.getElementById(loginFields.emailId);
    this.passwordInput = document.getElementById(loginFields.passwordId);
    this.registerSubmitBtn = document.getElementById(loginFields.submtBtn);
  }

  validateEmail(name, element, value) {
    let message, isValid;

    if (value === "") {
      message = "El email no puede estar vacío";
      isValid = false;
    }

    if (value !== "") {
      const regex =
        /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      isValid = regex.test(value);
      message = isValid ? "" : "El email no es válido";
    }

    if (isValid) {
      delete this.errors[name];
      element.classList.remove("is-invalid");
      document.getElementById(`${element.id}_error`).innerHTML = "";
      this.fields[name].value = value;
      return;
    } else {
      this.fields[name].value = "";
    }

    this.errors[name] = {
      element: element,
      message,
    };
  }

  validatePassword(name, element, value) {
    const isValid = value !== "";
    const message = isValid ? "" : "El password no puede estar vacío";

    if (isValid) {
      delete this.errors[name];
      element.classList.remove("is-invalid");
      document.getElementById(`${element.id}_error`).innerHTML = "";
      this.fields[name].value = value;
      return;
    } else {
      this.fields[name].value = "";
    }

    this.errors[name] = {
      element: element,
      message,
    };
  }

  registerLoginFields() {
    const requiredFields = [
      {
        name: "emailInput",
        element: this.emailInput,
        validate: this.validateEmail.bind(this),
      },
      {
        name: "passwordInput",
        element: this.passwordInput,
        validate: this.validatePassword.bind(this),
      },
    ];
    requiredFields.forEach((field) => {
      this.fields[field.name] = {
        name: field.name,
        validate: field.validate,
        element: field.element,
        value: "",
      };
    });
  }

  assignListeners() {
    this.form.addEventListener("submit", this.send.bind(this));
  }

  init() {
    this.redirectToRooms();
    this.registerLoginFields();
    this.assignListeners();
  }

  async loginUser(data) {
    const newUser = data;
    try {
      const loginUSer = await loginInUser(newUser);
      if (loginUSer) {
        this.storage.setLocalStorage("me", loginUSer, "session");
        window.location.href = "/rooms";
      }
    } catch (error) {
      this.showErrorMessage(error.data.message);
    }
  }

  showErrorMessage(message) {
    const messageElement = document.getElementById("errorMessage");
    messageElement.innerHTML = message;
    messageElement.classList.remove("d-none");
  }

  redirectToRooms() {
    let user = this.storage.getLocalStorage("me", "session");
    if (user) {
      window.location.href = "/rooms";
    }
  }

  send(e) {
    e.preventDefault();
    const fields = this.fields;

    const errorMessageElement = document.getElementById("errorMessage");
    errorMessageElement.classList.add("d-none");

    Object.keys(fields).forEach((field) => {
      this.fields[field].validate(
        fields[field].name,
        fields[field].element,
        fields[field].element.value
      );
    });

    const existErrors = Object.keys(this.errors).length !== 0;

    if (existErrors) {
      Object.keys(this.errors).forEach((error) => {
        const inputElement = this.errors[error].element;
        const msgErrorElement = `${inputElement.id}_error`;
        inputElement.classList.add("is-invalid");
        document.getElementById(msgErrorElement).innerHTML =
          this.errors[error].message;
      });
      return;
    }

    const data = {
      email: this.fields.emailInput.value,
      password: this.fields.passwordInput.value,
    };

    // Método para enviar la información al localStorage, al apartado de usuaros conectados
    this.loginUser(data);
  }

  socketListeners() {
    this.socket.on("get_db_users", (data) => {
      this.usersDb = data;
    });
  }
}

export default Login;
