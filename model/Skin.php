<?php


class Skin extends Model
{
    protected $tableName = "nicks";

    public function __construct()
    {
        parent::__construct();

        $sql = "CREATE TABLE IF NOT EXISTS `nicks` (
    `id` int(11) AUTO_INCREMENT PRIMARY KEY,
    `time` bigint(32) NOT NULL,
    `nick` text NOT NULL,
    `skin_id` int(11) NOT NULL,
    `password` text NOT NULL,
    `is_admin` tinyint(1) DEFAULT 0,
    `is_moder` tinyint(1) DEFAULT 0,
    `user_id` int(11) NOT NULL,
    `is_transparent_skin` TINYINT(1) DEFAULT 0,
    `is_turning_skin` TINYINT(1) DEFAULT 0
)";
        $this->mysqli->query($sql);

        $sql = "ALTER TABLE `nicks` ADD `time` bigint(32)";
        $this->mysqli->query($sql);
        $sql = "ALTER TABLE `nicks` ADD `is_transparent_skin` TINYINT(1) DEFAULT 0";
        $this->mysqli->query($sql);
        $sql = "ALTER TABLE `nicks` ADD `is_turning_skin` TINYINT(1) DEFAULT 0";
        $this->mysqli->query($sql);
    }

    public function getSkinsByUserId($userId)
    {
        $userId = $this->mysqli->real_escape_string($userId);

        $sql = "SELECT * FROM `nicks` WHERE `user_id`=" . $userId;
        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return [];

        $arr = [];
        while ($row = $result->fetch_assoc()) {
            if (!empty($row['skin_id'])) {
                $image = new Image();
                $path = $image->getPath($row['skin_id']);
                $row['skin'] = $path;
            }
            array_push($arr, $row);
        }
        return $arr;
    }

    public function createNick($nick, $password, $skinId, $userId, $isTransparentSkin, $isTurningSkin)
    {
        $nick = $this->mysqli->real_escape_string($nick);
        $password = $this->mysqli->real_escape_string($password);
        $skinId = $this->mysqli->real_escape_string($skinId);
        $userId = $this->mysqli->real_escape_string($userId);
        $isTransparentSkin = $this->mysqli->real_escape_string($isTransparentSkin);
        $isTurningSkin = $this->mysqli->real_escape_string($isTurningSkin);

        $sql = "INSERT INTO `nicks` (`nick`, `time`, `skin_id`, `password`, `user_id`, `is_transparent_skin`, `is_turning_skin`) VALUES ('" . $nick . "', " . time() . ", '" . $skinId . "', '" . $password . "', '" . $userId . "', " . $isTransparentSkin . ", " . $isTurningSkin . ")";
        if ($this->mysqli->query($sql)) return $this->mysqli->insert_id;

        return false;
    }

    public function getByNick($nick, $forAdmin = false)
    {
        $nick = $this->mysqli->real_escape_string($nick);

        $sql = "SELECT * FROM `nicks` WHERE LOWER(`nick`) LIKE '" . mb_strtolower($nick, "UTF-8") . "'";
        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return false;

        $row = $result->fetch_assoc();
        if (!empty($row['skin_id'])) {
            $image = new Image();
            $path = $image->getPath($row['skin_id']);
            $row['skin'] = $path;
        }
        if (!empty($row['password'])) $row['is_password'] = 1;
        else $row['is_password'] = 0;
        if (!$forAdmin) {
            unset($row['password']);
            unset($row['is_admin']);
            unset($row['is_moder']);
            unset($row['user_id']);
        }
        return $row;
    }

}