<?php

require 'vendor/autoload.php';

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

$app = new \Slim\App;
$container = $app->getContainer();

$container['view'] = function($c) {
	$view = new \Slim\Views\Smarty('../smarty/templates', [
		'cacheDir' => '../smarty/cache',
		'compileDir' => '../smarty/compile',
		'pluginsDir' => '../smarty/plugins'
	]);

	return $view;
};

$app->get('/explorer[/{params:.*}]', function (Request $request, Response $response) {
	return $this->view->render($response,'explorer.html',Array());
});

$app->get('/votes[/{params:.*}]', function (Request $request, Response $response) {
	return $this->view->render($response,'votes.html',Array());
});

$app->get('/', function (Request $request, Response $response) {
	return $this->view->render($response,'index.html',Array());
});

$app->run();
?>
