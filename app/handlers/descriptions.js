// handler to contain text related to the scoring function

exports.version = "0.0.1";

exports.text = function(a) {
// switch statement used to return descriptions
  swith(a) {
    case 0 :
    return "The application was not able to obtain any previous state about the user ";
    break;

    case 1 :
    return " The user was found in memory, there is no persistence of the user over the lifetime of the application. ";
    break;

    case 2 :
    return " The user was fond on a file on disk, there is limited persistence.";
    break;

    case 3 :
    return " The user was found on a external database, there is high persistence of the data";
    break;
  }


}
