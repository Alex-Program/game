<?php


class Image extends Model
{

    public function __construct()
    {
        parent::__construct();

        $sql = "CREATE TABLE IF NOT EXISTS `images` (
    `id` int(11) AUTO_INCREMENT PRIMARY KEY,
    `time` bigint(32) NOT NULL,
    `path` text NOT NULL
)";
        $this->mysqli->query($sql);
    }

    static function base64Decode($base64)
    {
        $img = str_replace('data:image/png;base64,', '', $base64);
        $img = str_replace(' ', '+', $img);
        try {
            $img = base64_decode($img);
        } catch (Throwable $e) {
            return false;
        }
        return $img;
    }

    public function addImage($img)
    {
        $sql = "INSERT INTO `images` (`time`) VALUES (" . time() . ")";

        if (!$this->mysqli->query($sql)) return false;

        $id = $this->mysqli->insert_id;
        if (!is_dir("../src/all_images")) mkdir("../src/all_images");
        file_put_contents("../src/all_images/" . $id . ".png", $img);
        $sql = "UPDATE `images` SET `path`='/src/all_images/" . $id . ".png' WHERE `id`=" . $id;
        if (!$this->mysqli->query($sql)) return false;
        return $id;
    }

    public function addImgByBase64($base64)
    {
        $img = Image::base64Decode($base64);
        if (!$img) return false;

        return $this->addImage($img);
    }

    public function getPath($id)
    {
        $id = $this->mysqli->real_escape_string($id);
        $sql = "SELECT `path` FROM `images` WHERE `id`=" . $id;
        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return false;

        $row = $result->fetch_assoc();
        return $row['path'];
    }

}