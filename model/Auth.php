<?php


class Auth extends Model
{

    const KEY = "erpog^&*#^&*^@#734895jsodfj^&*@(&%(*&@*(#%OKOjokej3IHREHW@#%&(*23534%*#@";

    public function __construct()
    {
        parent::__construct();

    }

    public function authByToken($userId, $token)
    {
        $userId = $this->mysqli->real_escape_string($userId);
        $token = $this->mysqli->real_escape_string($token);

        $sql = "SELECT * FROM `users` WHERE `id`=" . $userId . " AND `token` LIKE '" . $token . "'";
        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return false;

        return $result->fetch_assoc();
    }

    public function authByPass($userId, $password)
    {
        $userId = $this->mysqli->real_escape_string($userId);
        $password = $this->mysqli->real_escape_string($password);

        $sql = "SELECT * FROM `users` WHERE `id`=" . $userId . " AND `password` LIKE '" . $password . "'";
        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return false;

        return $result->fetch_assoc();
    }

    public function updateToken($userId, $token)
    {
        $userId = $this->mysqli->real_escape_string($userId);
        $token = $this->mysqli->real_escape_string($token);

        $sql = "UPDATE `users` SET `token`='" . $token . "' WHERE `id`=" . $userId;
        if ($this->mysqli->query($sql)) return true;

        return false;
    }

    public function getUserInfo($userId, $isAdmin = false)
    {
        $userId = $this->mysqli->real_escape_string($userId);

        $sql = "SELECT * FROM `users` WHERE `id`=" . $userId;
        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return false;

        $row = $result->fetch_assoc();
        if (!$isAdmin) {
            unset($row['password']);
            unset($row['token']);
        }

        return $row;
    }

    public function updateUserInfo($col, $val, $userId){
        $col = $this->mysqli->real_escape_string($col);
        $val = $this->mysqli->real_escape_string($val);
        $userId = $this->mysqli->real_escape_string($userId);

        $sql = "UPDATE `users` SET `".$col."`='".$val."' WHERE `id`=".$userId;
        if($this->mysqli->query($sql)) return true;

        return false;
    }

    public function getByUserName($name, $isAdmin = false){
        $name = $this->mysqli->real_escape_string($name);

        $sql = "SELECT * FROM `users` WHERE `name` LIKE '".$name."'";
        $result =$this->mysqli->query($sql);
        if($result->num_rows === 0) return false;

        $row = $result->fetch_assoc();
        if(!$isAdmin){
            unset($row['password']);
            unset($row['token']);
        }

        return $row;
    }

}