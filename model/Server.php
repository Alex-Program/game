<?php


class Server extends Model
{

    public function __construct()
    {
        $this->tableName = "servers";
        parent::__construct();

        $sql = "CREATE TABLE IF NOT EXISTS `servers` (
    `id` int(11) AUTO_INCREMENT PRIMARY KEY,
    `ip` text NOT NULL,
    `name` text NOT NULL
)";
        $this->mysqli->query($sql);
    }

    public function getAllServers()
    {
        $sql = "SELECT * FROM `servers`";
        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return [];

        $arr = [];
        while ($row = $result->fetch_assoc()) {
            array_push($arr, $row);
        }

        return $arr;
    }

    public function changeServer($id, $name, $ip)
    {
        $id = $this->mysqli->real_escape_string($id);
        $name = $this->mysqli->real_escape_string($name);
        $ip = $this->mysqli->real_escape_string($ip);

        $sql = "UPDATE `servers` SET `name`='" . $name . "', `ip`='" . $ip . "' WHERE `id`=" . $id;
        if ($this->mysqli->query($sql)) return $id;

        return false;
    }

    public function addServer($name, $ip)
    {
        $name = $this->mysqli->real_escape_string($name);
        $ip = $this->mysqli->real_escape_string($ip);

        $sql = "INSERT INTO `servers` (`name`, `ip`) VALUES ('" . $name . "', '" . $ip . "')";
        if ($this->mysqli->query($sql)) return $this->mysqli->insert_id;

        return false;
    }

    public function deleteServer($id)
    {
        $id = $this->mysqli->real_escape_string($id);

        $sql = "DELETE FROM `servers` WHERE `id`=" . $id;
        if ($this->mysqli->query($sql)) return true;

        return false;
    }

}