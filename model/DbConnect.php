<?php


class DbConnect
{
    private static ?mysqli $mysqli = null;

    public static function getInstance(): mysqli {
        if (self::$mysqli === null) {
            self::$mysqli = new mysqli("localhost", "root", DB_PASS, "game");
        }

        return self::$mysqli;
    }

}