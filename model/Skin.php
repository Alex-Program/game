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
    `is_turning_skin` TINYINT(1) DEFAULT 0,
    `is_invisible_nick` TINYINT(1) DEFAULT 0,
    `is_random_color` TINYINT(1) DEFAULT 0,
    `is_clan` TINYINT(1) DEFAULT 0,
    `is_helper` TINYINT(1) DEFAULT 0,
    `is_gold` TINYINT(1) DEFAULT 0,
    `is_violet` TINYINT(1) DEFAULT 0
)";
        $this->mysqli->query($sql);

        $sql = "ALTER TABLE `nicks` ADD `time` bigint(32)";
        $this->mysqli->query($sql);
        $sql = "ALTER TABLE `nicks` ADD `is_transparent_skin` TINYINT(1) DEFAULT 0";
        $this->mysqli->query($sql);
        $sql = "ALTER TABLE `nicks` ADD `is_turning_skin` TINYINT(1) DEFAULT 0";
        $this->mysqli->query($sql);
        $sql = "ALTER TABLE `nicks` ADD `is_invisible_nick` TINYINT(1) DEFAULT 0";
        $this->mysqli->query($sql);
        $sql = "ALTER TABLE `nicks` ADD `is_random_color` TINYINT(1) DEFAULT 0";
        $this->mysqli->query($sql);
        $sql = "ALTER TABLE `nicks` ADD `is_clan` TINYINT(1) DEFAULT 0";
        $this->mysqli->query($sql);
        $sql = "ALTER TABLE `nicks` ADD `is_helper` TINYINT(1) DEFAULT 0";
        $this->mysqli->query($sql);
        $sql = "ALTER TABLE `nicks` ADD `is_gold` TINYINT(1) DEFAULT 0";
        $this->mysqli->query($sql);
        $sql = "ALTER TABLE `nicks` ADD `is_violet` TINYINT(1) DEFAULT 0";
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

    public function createNick($nick, $password, $skinId, $userId, $isTransparentSkin, $isTurningSkin, $isInvisibleNick, $isRandomColor, $isClan = false)
    {
        $nick = $this->mysqli->real_escape_string($nick);
        $password = $this->mysqli->real_escape_string($password);
        $skinId = $this->mysqli->real_escape_string($skinId);
        $userId = $this->mysqli->real_escape_string($userId);
        $isTransparentSkin = $this->mysqli->real_escape_string($isTransparentSkin);
        $isTurningSkin = $this->mysqli->real_escape_string($isTurningSkin);
        $isInvisibleNick = $this->mysqli->real_escape_string($isInvisibleNick);
        $isRandomColor = $this->mysqli->real_escape_string($isRandomColor);
        $isClan = (int)$isClan;

        $sql = "INSERT INTO `nicks` (`nick`, `time`, `skin_id`, `password`, `user_id`, `is_transparent_skin`, `is_turning_skin`, `is_invisible_nick`, `is_random_color`, `is_clan`) VALUES ('" . $nick . "', " . time() . ", '" . $skinId . "', '" . $password . "', '" . $userId . "', " . $isTransparentSkin . ", " . $isTurningSkin . ", " . $isInvisibleNick . ", " . $isRandomColor . ", " . $isClan . ")";
        if ($this->mysqli->query($sql)) return $this->mysqli->insert_id;

        return false;
    }

    public function getByNick($nick, $forAdmin = false, $isClan = false)
    {
        $nick = $this->mysqli->real_escape_string($nick);

        $sql = "SELECT * FROM `nicks` WHERE LOWER(`nick`) LIKE '" . mb_strtolower($nick, "UTF-8") . "'";
        $sql = $isClan ? $sql . " AND `is_clan`=1" : $sql . " AND `is_clan`=0";

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

    public function getAllNicks(){
        $sql = "SELECT * FROM `nicks`";
        $result = $this->mysqli->query($sql);
        if($result->num_rows === 0) return [];

        $arr = [];
        $image = new Image();
        while($row = $result->fetch_assoc()){
            if(!empty($row['skin_id'])){
                $row['skin'] = $image->getPath($row['skin_id']);
            }
            else $row['skin'] = "";
            array_push($arr, $row);
        }

        return $arr;
    }

}