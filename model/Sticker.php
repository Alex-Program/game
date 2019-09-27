<?php


class Sticker extends Model
{

    public function __construct()
    {
        parent::__construct();
        $sql = "CREATE TABLE IF NOT EXISTS `stickers` (
`id` int(11) AUTO_INCREMENT PRIMARY KEY,
`time` bigint(32) NOT NULL,
`name` text NOT NULL,
`group_id` int(11) NOT NULL,
`account_id` int(11) NOT NULL,
`stickers` text NOT NULL,
`is_valid` tinyint(1) DEFAULT 0
)";
        $this->mysqli->query($sql);
        $sql = "CREATE TABLE IF NOT EXISTS `sticker_groups` (
    `id` int(11) AUTO_INCREMENT PRIMARY KEY,
    `name` text NOT NULL 
)";
        $this->mysqli->query($sql);
    }

    public function getAllGroups()
    {
        $sql = "SELECT * FROM `sticker_groups`";
        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return [];

        $arr = [];
        while ($row = $result->fetch_assoc()) {
            array_push($arr, $row);
        }

        return $arr;
    }

    public function addStickers($name, $accountId, $groupId, $stickers, $isValid = 0)
    {
        $name = $this->mysqli->real_escape_string($name);
        $accountId = $this->mysqli->real_escape_string($accountId);
        $groupId = $this->mysqli->real_escape_string($groupId);
        $stickers = json_encode($stickers, 256);
        $isValid = $this->mysqli->real_escape_string($isValid);

        $sql = "INSERT INTO `stickers` (`time`, `name`, `group_id`, `account_id`, `stickers`, `is_valid`) VALUES (" . time() . ", '" . $name . "', " . $groupId . ", " . $accountId . ", '" . $stickers . "', " . $isValid . ")";
        if ($this->mysqli->query($sql)) return $this->mysqli->insert_id;

        return false;
    }

    public function getStickersInGroup($groupId = 0)
    {
        $groupId = $this->mysqli->real_escape_string($groupId);

        $sql = "SELECT * FROM `stickers`";
        if ($groupId == 0) $sql .= " ORDER BY `id` DESC LIMIT 10";
        else $sql .= " WHERE `group_id`=" . $groupId;

        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return [];

        $arr = [];
        $image = new Image();
        while ($row = $result->fetch_assoc()) {
            $stickers = json_decode($row['stickers'], true);

            foreach ($stickers as $key => $image_id){
                $stickers[$key] = ["src" => $image->getPath($image_id), "image_id" => $image_id];
            }
            $row['stickers'] = $stickers;
            array_push($arr, $row);
        }

        return $arr;
    }

}