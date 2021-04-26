<?php
class Newsletter
{
    private static $email;
    private static $datetime = null;

    private static $valid = true;

    public function __construct() {
        die('Init function is not allowed');
    }

    public static function register($email) {
        if (!empty($_POST)) {
            self::$email    = $_POST['signup-email'];
            self::$datetime = date('Y-m-d H:i:s');

            if (empty(self::$email)) {
                $status  = "Oh no";
                $message = "the email address field must not be blank";
                self::$valid = false;
            } else if (!filter_var(self::$email, FILTER_VALIDATE_EMAIL)) {
                $status  = "Oh no";
                $message = "you must fill the field with a valid email address";
                self::$valid = false;
            }

            if (self::$valid) {
                $pdo = Database::connect();
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $existingSignup = $pdo->prepare("SELECT COUNT(*) FROM signups WHERE signup_email_address='$email'");
                $existingSignup->execute();
                $data_exists = ($existingSignup->fetchColumn() > 0) ? true : false;

                if (!$data_exists) {
                    $sql = "INSERT INTO signups (signup_email_address, signup_date) VALUES (:email, :datetime)";
                    $q = $pdo->prepare($sql);

                    $q->execute(
                        array(':email' => self::$email, ':datetime' => self::$datetime));

                    if ($q) {
                        $status  = "Hell yeah";
                        $message = "you have been successfully subscribed.";
                    } else {
                        $status  = "Oh no";
                        $message = "an error occurred, please try again.";
                    }
                } else {
                    $status  = "Oh no";
                    $message = "this email is already subscribed.";
                }
            }

            $data = array(
                'status'  => $status,
                'message' => $message
            );

            if ($status == "Oh no") {
              echo '<div style="background-color: #fb4d46; color: white; padding: 5px;">', $status, ', ', $message, '</div>';
            } else {
              echo '<div style="background-color: #7da27e; color: white; padding: 5px;">', $status, ', ', $message;
            }

            Database::disconnect();
        }
    }
}
