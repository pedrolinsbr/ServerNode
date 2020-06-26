module.exports = function (app, cb) {

  var   api       = {};
  var   dao       = app.src.modHoraCerta.dao.ChecklistDAO;
  const utilsSa 	= app.src.utils.ConversorArquivos;
  const utils     = app.src.utils.DataAtual;
  const fs        = require('fs');
  var result      = [];
  var arqs;
  
  api.salvar = async function (req, res, next) {
    await dao.salvar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscar = async function (req, res, next) {
    await dao.buscar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.update = async function (req, res, next) {
    await dao.update(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.gravarChecklist = async function (req, res, next) {
    
    if (req.files.length == 0) {
      var err = new Error();
      err.message = 'Nenhum checklist enviado'
      err.dsurl = '/api/hc/checklist/up'
      next(err);
    }
    var name = req.files[0].originalname.split(".");
    if(name.length > 0){
      var ext = name.length -1;
      var extensao = name[ext];
    }

    req.files[0].originalname = "checklist-"+ req.body.checklist;
    var DirChecklist = process.env.FOLDER_CHECKLIST;
    var fullPath = DirChecklist + "checklist-" + req.body.idh006;
    var saved = false;
    let tempoAtualString = utils.tempoAtual().replace(/:/gi,'-');
      
    if(!fs.existsSync(fullPath)){
      fs.mkdir(fullPath);
    }
      var save = fullPath +"/"+ req.files[0].originalname + "-" + tempoAtualString + "." +extensao;

      saved = await fs.writeFile(save, req.files[0].buffer, function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      });

      if (typeof saved === 'undefined') saved = true;

      var fl = await fs.readdirSync(fullPath);
      
      if(fl !== undefined){
        let qtdArquivosCheckList = { ARQANEXO : fl.length , IDH006 : req.body.idh006};
       await atualizaQtdAnexosCheckList(qtdArquivosCheckList,res, next);
      }
      

      res.json({files:arqs, fl:fl, res:(saved ? 200 : 500, saved ? 'saved' : 'error')}); // 500, error
      
    }

    async function atualizaQtdAnexosCheckList(qtdArquivos,res, next){
      await dao.updateQtdArqanexo(qtdArquivos, res, next)
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
    }

    api.listarChecklist = async function (req, res, next) {
      
      var DirChecklist = process.env.FOLDER_CHECKLIST;
      var fullPath = DirChecklist + "checklist-" + req.params.id
      if(!fs.existsSync(fullPath)){
        return res.json({fl:fl});
      }else{
        var fl = await fs.readdirSync(fullPath);
        return res.json({fl:fl});

  
      }if(!fs.existsSync(fullPath)){
        return res.json({fl:fl});
      }else{
        var fl = await fs.readdirSync(fullPath);
        return res.json({fl:fl});

  
      }
     
    }

    api.removerChecklist = async function (req, res, next) {
      var DirChecklist = process.env.FOLDER_CHECKLIST;
      var fullPath = DirChecklist + "checklist-" + req.body.idh006 + "/" + req.body.checklist;

      if(fs.existsSync(fullPath)){
        fs.unlink(fullPath,function(err){
          if(err) return res.json({err:err});;
          return res.json({success:"Arquivo deletado com sucesso."});
        });  
      }else{
        return res.json({fl:"Arquivo não existe."});
      }
      
    }


  return api;
};
