<?php


class Prices extends Model
{
    protected $tableName = "prices";

    public function __construct()
    {
        parent::__construct();

        $sql = "CREATE TABLE IF NOT EXISTS `prices` (
`id` int(11) AUTO_INCREMENT PRIMARY KEY,
`name` text NOT NULL,
`price` int(11) NOT NULL
)";
        $this->mysqli->query($sql);

    }

    public function updatePrice($name, $price)
    {
        $name = $this->mysqli->real_escape_string($name);
        $price = $this->mysqli->real_escape_string($price);

        $sql = "SELECT * FROM `prices` WHERE `name` LIKE '" . $name . "'";
        $result = $this->mysqli->query($sql);

        if ($result->num_rows === 0) {
            $sql = "INSERT INTO `prices` (`name`,`price`) VALUES ('" . $name . "', " . $price . ")";
        } else {
            $sql = "UPDATE `prices` SET `price`=" . $price . " WHERE `name` LIKE '" . $name . "'";
        }

        if ($this->mysqli->query($sql)) return true;

        return false;
    }


    /**
     * Return all prices [["name" => "", "price" => ""]]
     * @return array
     */
    public function getAllPrices()
    {
        $sql = "SELECT * FROM `prices`";

        $result = $this->mysqli->query($sql);
        if ($result->num_rows === 0) return [];

        $arr = [];
        while ($row = $result->fetch_assoc()) {
            unset($row['id']);
            array_push($arr, $row);
        }

        return $arr;
    }


    /**
     * Return price ["name"=>"price"]
     * @return array
     */
    public function getAllPriceToName(){
        $sql = "SELECT * FROM `prices`";

        $result = $this->mysqli->query($sql);
        if($result->num_rows === 0) return [];

        $arr = [];
        while($row = $result->fetch_assoc()){
            $arr[$row['name']]= $row['price'];
        }

        return $arr;
    }

}