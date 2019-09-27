<?php


class Model
{
    protected $mysqli;

    public function __construct()
    {
        $this->mysqli = new mysqli("localhost", "root", "root", "game");
        if ($this->mysqli->connect_errno) exit("DB ERROR");
        $this->mysqli->set_charset("utf8");
        $sql = "set global sql_mode=''";
        $this->mysqli->query($sql);

        $this->mysqli->query("SET time_zone = '+00:00'");

    }

    static function generateHash()
    {
        $random = md5(base64_encode(random_int(10000, 99999))); // первый ключ
        $random1 = md5(base64_encode(random_int(10000, 99999))); // строка которая будет зашифрована
        $random2 = md5(base64_encode(random_int(10000, 99999))); // второй ключ
        $first_crypt = crypt($random1, '$6$' . $random);

        $second_crypt = crypt($random1, '$6$' . $random2);
        return $first_crypt . $second_crypt;
    }

    static function cryptByKey($val, $key1)
    {
        $keyMd5 = md5(base64_encode($key1));
        $valMd5 = md5(base64_encode($val));
        $first_crypt = crypt($valMd5, '$6$' . $keyMd5);
        $second_crypt = crypt($keyMd5, '$6$' . $valMd5);

        return $first_crypt . $second_crypt;
    }

    public function getById($id)
    {
        $id = $this->mysqli->real_escape_string($id);

        $sql = "SELECT * FROM `" . $this->table_name . "` WHERE `id`=" . $id;
        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return false;

        return $result->fetch_assoc();
    }

    public function updateColumn($column, $value, $id)
    {
        $column = $this->mysqli->real_escape_string($column);
        $value = $this->mysqli->real_escape_string($value);
        $id = $this->mysqli->real_escape_string($id);

        $sql = "UPDATE `" . $this->table_name . "` SET `" . $column . "`='" . $value . "' WHERE `id`=" . $id;
        if ($this->mysqli->query($sql)) return true;

        return false;
    }

}