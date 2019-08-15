<?php


class Skin extends Model
{

    public function __construct()
    {
        parent::__construct();
    }

    public function getSkinsByUserId($userId)
    {
        $userId = $this->mysqli->real_escape_string($userId);

        $sql = "SELECT * FROM `skins` WHERE `user_id`=" . $userId;
        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return [];

        $arr = [];
        while ($row = $result->fetch_assoc()) {
            array_push($arr, $row);
        }
        return $arr;
    }

}