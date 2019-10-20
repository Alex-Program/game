<?php


class Auth extends Model
{

    const KEY = "erpog^&*#^&*^@#734895jsodfj^&*@(&%(*&@*(#%OKOjokej3IHREHW@#%&(*23534%*#@";

    public function __construct()
    {
        parent::__construct();
        $this->tableName = "users";

        $sql = "CREATE TABLE IF NOT EXISTS `users` (
    `id` int(11) AUTO_INCREMENT PRIMARY KEY,
    `password` text NOT NULL,
    `token` text NOT NULL,
    `name` text NOT NULL,
    `img` text NOT NULL,
    `stickers` text NOT NULL,
    `balance` int(11) default 0,
    `level` int(11) default 0,
    `experience` bigint(32) default 0,
    `is_admin` tinyint(1) default 0,
    `is_banned` tinyint(1) default 0
)";
        $this->mysqli->query($sql);

        $sql = "ALTER TABLE `users` ADD `level` int(11) default 1";
        $this->mysqli->query($sql);
        $sql = "ALTER TABLE `users` ADD `experience` bigint(32) default 0";
        $this->mysqli->query($sql);
        $sql = "ALTER TABLE `users` ADD `is_admin`tinyint(1) default 0";
        $this->mysqli->query($sql);
        $sql = "ALTER TABLE `users` ADD `is_banned`tinyint(1) default 0";
        $this->mysqli->query($sql);
    }

    public function registration($password, $name)
    {
        $password = $this->mysqli->real_escape_string($password);
        $name = $this->mysqli->real_escape_string($name);

        $sql = "INSERT INTO `users` (`password`, `name`) VALUES ('" . $password . "', '" . $name . "')";
        if ($this->mysqli->query($sql)) return $this->mysqli->insert_id;

        return false;
    }

    public function authByToken($userId, $token)
    {
        $userId = $this->mysqli->real_escape_string($userId);
        $token = $this->mysqli->real_escape_string($token);

        $sql = "SELECT * FROM `users` WHERE `id`=" . $userId . " AND `token` LIKE '" . $token . "'";
        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return false;

        $row = $result->fetch_assoc();
        if (empty($row['stickers'])) $row['stickers'] = [];
        else $row['stickers'] = json_decode($row['stickers'], true);
        return $row;
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

    public function updateUserInfo($col, $val, $userId)
    {
        $col = $this->mysqli->real_escape_string($col);
        $val = $this->mysqli->real_escape_string($val);
        $userId = $this->mysqli->real_escape_string($userId);

        $sql = "UPDATE `users` SET `" . $col . "`='" . $val . "' WHERE `id`=" . $userId;
        if ($this->mysqli->query($sql)) return true;

        return false;
    }

    public function getByUserName($name, $isAdmin = false)
    {
        $name = $this->mysqli->real_escape_string($name);

        $sql = "SELECT * FROM `users` WHERE `name` LIKE '" . $name . "'";
        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return false;

        $row = $result->fetch_assoc();
        if (!$isAdmin) {
            unset($row['password']);
            unset($row['token']);
        }

        return $row;
    }

    public function getUserStickers($userId)
    {
        $userId = $this->mysqli->real_escape_string($userId);

        $sql = "SELECT `stickers` FROM `users` WHERE `id`=" . $userId;
        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return [];

        $row = $result->fetch_assoc();
        $stickers = $row['stickers'];
        if (empty($stickers)) return [];
        try {
            $stickers = json_decode($stickers, true);
        } catch (Throwable $e) {
            return [];
        }

        $s = new Sticker();

        foreach ($stickers as $key => $stickerId) {
            $stickers[$key] = $s->getStickerSet($stickerId);
        }

        return $stickers;
    }
}