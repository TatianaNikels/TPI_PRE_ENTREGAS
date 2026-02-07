-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-02-2026 a las 17:27:50
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `boletin_digital`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materias`
--

CREATE TABLE `materias` (
  `id_materias` int(11) UNSIGNED NOT NULL,
  `nombre_materia` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materias`
--

INSERT INTO `materias` (`id_materias`, `nombre_materia`) VALUES
(5, 'Asistencia 2'),
(6, 'Autogestion'),
(7, 'Hardware 4'),
(2, 'Ingles Tecnico'),
(4, 'Marco Jurídico y Derecho Del Trabajo'),
(1, 'Matematica'),
(8, 'Practicas Profesionalizantes'),
(9, 'Programacion'),
(10, 'Redes 3'),
(3, '[value-2]');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notas`
--

CREATE TABLE `notas` (
  `id_nota` int(11) NOT NULL,
  `estudiante_dni` varchar(20) NOT NULL,
  `docente_nombre` varchar(100) NOT NULL,
  `grado` varchar(20) NOT NULL,
  `materia` varchar(50) NOT NULL,
  `nota_p1` decimal(4,2) DEFAULT NULL,
  `nota_p2` decimal(4,2) DEFAULT NULL,
  `nota_c1` decimal(4,2) DEFAULT NULL,
  `nota_p3` decimal(4,2) DEFAULT NULL,
  `nota_p4` decimal(4,2) DEFAULT NULL,
  `nota_c2` decimal(4,2) DEFAULT NULL,
  `nota_final` decimal(4,2) DEFAULT NULL,
  `fecha_carga` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_usuarios` int(10) UNSIGNED NOT NULL,
  `id_materias` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notas_informe`
--

CREATE TABLE `notas_informe` (
  `id_informe` int(11) NOT NULL,
  `estudiante_dni` varchar(15) DEFAULT NULL,
  `docente_nombre` varchar(100) DEFAULT NULL,
  `grado` varchar(50) DEFAULT NULL,
  `materia` varchar(100) DEFAULT NULL,
  `nota_p1_c1` varchar(5) DEFAULT NULL,
  `nota_p2_c1` varchar(5) DEFAULT NULL,
  `nota_c1` varchar(5) DEFAULT NULL,
  `nota_p1_c2` varchar(5) DEFAULT NULL,
  `nota_p2_c2` varchar(5) DEFAULT NULL,
  `nota_c2` varchar(5) DEFAULT NULL,
  `nota_final` varchar(5) DEFAULT NULL,
  `fecha_carga` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `notas_informe`
--

INSERT INTO `notas_informe` (`id_informe`, `estudiante_dni`, `docente_nombre`, `grado`, `materia`, `nota_p1_c1`, `nota_p2_c1`, `nota_c1`, `nota_p1_c2`, `nota_p2_c2`, `nota_c2`, `nota_final`, `fecha_carga`) VALUES
(26, '49045601', 'Leandro Nikels', '7°3', 'Asistencia 2', '10', '10', NULL, NULL, NULL, NULL, '10', '2026-02-06 02:11:19'),
(27, '49045601', 'Leandro Nikels', '7°3', 'Marco Juridico y Derechos del Trabajo', '6', '6', '6', '6', '6', '6', '6', '2026-02-06 02:11:19'),
(28, '49045601', 'Leandro Nikels', '7°3', 'Matematica', '1', '2', '3', '4', '5', '6', '7', '2026-02-06 02:11:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_usuario`
--

CREATE TABLE `tipo_usuario` (
  `id_tipo` int(11) UNSIGNED NOT NULL,
  `Nombre_TIPO` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_usuario`
--

INSERT INTO `tipo_usuario` (`id_tipo`, `Nombre_TIPO`) VALUES
(1, 'Alumno/a'),
(2, 'Docente'),
(3, 'Dto_Alumnado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuarios` int(11) UNSIGNED NOT NULL,
  `nombre_Apellido` varchar(50) NOT NULL,
  `dni` varchar(15) NOT NULL,
  `correo_Electronico` varchar(30) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `telefono` varchar(25) NOT NULL,
  `curso` enum('7°1','7°2','7°3','') NOT NULL,
  `id_tipo` int(11) UNSIGNED NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuarios`, `nombre_Apellido`, `dni`, `correo_Electronico`, `contrasena`, `telefono`, `curso`, `id_tipo`, `fecha_registro`) VALUES
(73, 'Tatiana Nikels', '47927177', 'tatiana@gmail.com', '1234', '2964555174', '7°2', 2, '2026-02-05 23:30:49'),
(74, 'Leandro Nikels', '49045601', 'leandronikels12@gmail.com', '567891', '2964696978', '7°3', 1, '2026-02-05 23:35:01'),
(75, 'Celeste Benites', '47.927.177', 'celestebenites26@gmail.com', '1234', '2964617170', '7°1', 1, '2026-02-07 11:29:28');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `materias`
--
ALTER TABLE `materias`
  ADD PRIMARY KEY (`id_materias`),
  ADD UNIQUE KEY `Nombre_Materia` (`nombre_materia`);

--
-- Indices de la tabla `notas`
--
ALTER TABLE `notas`
  ADD PRIMARY KEY (`id_nota`),
  ADD KEY `id_usuarios` (`id_usuarios`),
  ADD KEY `id_materias` (`id_materias`);

--
-- Indices de la tabla `notas_informe`
--
ALTER TABLE `notas_informe`
  ADD PRIMARY KEY (`id_informe`),
  ADD KEY `estudiante_dni` (`estudiante_dni`);

--
-- Indices de la tabla `tipo_usuario`
--
ALTER TABLE `tipo_usuario`
  ADD PRIMARY KEY (`id_tipo`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuarios`),
  ADD UNIQUE KEY `DNI` (`dni`),
  ADD UNIQUE KEY `Correo Electronico` (`correo_Electronico`),
  ADD KEY `usuario_id_tipo_tipo_usuario` (`id_tipo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `materias`
--
ALTER TABLE `materias`
  MODIFY `id_materias` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `notas`
--
ALTER TABLE `notas`
  MODIFY `id_nota` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notas_informe`
--
ALTER TABLE `notas_informe`
  MODIFY `id_informe` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `tipo_usuario`
--
ALTER TABLE `tipo_usuario`
  MODIFY `id_tipo` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuarios` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `notas`
--
ALTER TABLE `notas`
  ADD CONSTRAINT `notas_ibfk_1` FOREIGN KEY (`id_usuarios`) REFERENCES `usuario` (`id_usuarios`),
  ADD CONSTRAINT `notas_ibfk_2` FOREIGN KEY (`id_materias`) REFERENCES `materias` (`id_materias`);

--
-- Filtros para la tabla `notas_informe`
--
ALTER TABLE `notas_informe`
  ADD CONSTRAINT `notas_informe_ibfk_1` FOREIGN KEY (`estudiante_dni`) REFERENCES `usuario` (`dni`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_id_tipo_tipo_usuario` FOREIGN KEY (`id_tipo`) REFERENCES `tipo_usuario` (`id_tipo`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
