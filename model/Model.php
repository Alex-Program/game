<?php


class Model
{
    protected mysqli $mysqli;
    protected string $tableName = "";

    public function __construct() {

        $this->mysqli = DbConnect::getInstance();
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

        $sql = "SELECT * FROM `" . $this->tableName . "` WHERE `id`=" . $id;
        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return false;

        return $result->fetch_assoc();
    }

    public function updateColumn($column, $value, $id)
    {
        $column = $this->mysqli->real_escape_string($column);
        $value = $this->mysqli->real_escape_string($value);
        $id = $this->mysqli->real_escape_string($id);

        $sql = "UPDATE `" . $this->tableName . "` SET `" . $column . "`='" . $value . "' WHERE `id`=" . $id;
        if ($this->mysqli->query($sql)) return true;

        return false;
    }

    static function sendPostRequest($url, $data)
    {
        $post = http_build_query($data);
        $post = urldecode($post);
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Token: elrjglkejrglkjekjwlkejflkwjelkfjwkleg", "User-Id: 0"]);
        $response = curl_exec($ch);
        curl_close($ch);

        try {
            $response = json_decode($response, true);
            if (!is_array($response)) return false;
        } catch (Throwable $e) {
        }

        return $response;
    }

}