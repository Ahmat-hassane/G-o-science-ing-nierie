<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
header('Content-Type: application/json; charset=utf-8');
$debug = isset($_GET['debug']) && $_GET['debug'] === '1';
function respond($ok, $code = null, $detail = null) {
  $res = ['success' => $ok];
  if (!$ok && $code) $res['error'] = $code;
  if (!$ok && $detail) $res['detail'] = $detail;
  echo json_encode($res); exit;
}
$hp = isset($_POST['hp_field']) ? trim($_POST['hp_field']) : '';
if ($hp !== '') {
  respond(false, 'spam_detected');
}
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$subject = isset($_POST['subject']) ? trim($_POST['subject']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';
$name = mb_substr($name, 0, 120);
$subject = $subject !== '' ? mb_substr($subject, 0, 160) : 'Nouveau message via le site GESI';
$phone = mb_substr($phone, 0, 60);
$message = mb_substr(strip_tags($message), 0, 5000);
if ($name === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === '') {
  respond(false, 'invalid_input');
}
$config = require __DIR__ . '/config.php';
$base = __DIR__ . '/../vendor/phpmailer/src/';
$haveLib = file_exists($base . 'PHPMailer.php') && file_exists($base . 'SMTP.php') && file_exists($base . 'Exception.php');
if (!$haveLib) {
  respond(false, 'library_missing');
}
require $base . 'PHPMailer.php';
require $base . 'SMTP.php';
require $base . 'Exception.php';
$toEmailValid = isset($config['to_email']) && filter_var($config['to_email'], FILTER_VALIDATE_EMAIL);
$fromEmailValid = isset($config['from_email']) && filter_var($config['from_email'], FILTER_VALIDATE_EMAIL);
if (!$toEmailValid || !$fromEmailValid || empty($config['smtp_host']) || empty($config['smtp_user']) || empty($config['smtp_pass'])) {
  respond(false, 'config_invalid', $debug ? 'SMTP or email config invalid' : null);
}
$mail = new PHPMailer(true);
try {
  $mail->isSMTP();
  $mail->Host = $config['smtp_host'];
  $mail->SMTPAuth = true;
  $mail->Username = $config['smtp_user'];
  $mail->Password = $config['smtp_pass'];
  $mail->SMTPSecure = $config['smtp_secure'];
  $mail->Port = $config['smtp_port'];
  $mail->CharSet = 'UTF-8';
  $mail->isHTML(false);
  $mail->setFrom($config['from_email'], $config['from_name']);
  $mail->addAddress($config['to_email']);
  $mail->addReplyTo($email, $name);
  $mail->Subject = $subject;
  $mail->Body = "Nom: $name\nEmail: $email\nTéléphone: " . ($phone !== '' ? $phone : 'non renseigné') . "\n\n$message";
  $mail->send();
  respond(true);
} catch (Exception $e) {
  respond(false, 'mail_send_failed', $debug ? $e->getMessage() : null);
}
