import Categoria from "../models/categoria.js";

export const crearCategoria = async (req, res) => {
  try {
    const categoriaNueva = new Categoria(req.body);
    await categoriaNueva.save();
    res.status(201).json({ mensaje: "Categoría creada correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrió un error al intentar crear una categoría" });
  }
};

export const listarCategorias = async (req, res) => {
  try {
    const { termino, pagina = 1, limite = 10 } = req.query;
    const pageNum = parseInt(pagina);
    const limit = parseInt(limite);
    const skip = (pageNum - 1) * limit;
    const query = {};
    if (termino) {
      query.nombre = { $regex: termino, $options: "i" };
    }

    const [categorias, cantidadCategorias] = await Promise.all([
      Categoria.find(query).skip(skip).limit(limit),
      Categoria.countDocuments(query),
    ]);

    res.status(200).json({
      categorias,
      cantidadCategorias,
      paginaActual: pageNum,
      totalPaginas: Math.ceil(cantidadCategorias / limit),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrió un error al intentar listar las categorías" });
  }
};

export const categoriaBuscada = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }
    res.status(200).json(categoria);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrió un error al intentar buscar una categoría" });
  }
};

export const borrarCategoria = async (req, res) => {
  try {
    const categoriaBorrada = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoriaBorrada) {
      return res
        .status(404)
        .json({ mensaje: "No se encontró la categoría para borrar" });
    }
    res.status(200).json({ mensaje: "La categoría fue borrada correctamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrió un error al intentar borrar una categoría" });
  }
};

export const editarCategoria = async (req, res) => {
  try {
    const categoriaEditada = await Categoria.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!categoriaEditada) {
      return res.status(404).json({ mensaje: "La categoría no fue encontrada" });
    }
    res.status(200).json(categoriaEditada);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ mensaje: "Ocurrió un error al intentar editar una categoría" });
  }
};
