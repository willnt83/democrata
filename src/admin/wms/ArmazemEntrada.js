import React, { Component } from 'react'
import { Table, Icon, Modal, Input, Button, Row, Col, Form, Select, DatePicker, TimePicker, Divider, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'

let id = 0

const statusInsumoOption = [
    {value: 'S', description: 'Solicitado'},
    {value: 'E', description: 'Entregue'},
    {value: 'C', description: 'Conferido'}
]

class ArmazemEntrada extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Entrada de Insumos')
    }

    state = {
        tableLoading: false,
        tableData: [],
        showSearchModal: false,
        showEntradaModal: false,
        showEntradaModalStatus: false,
        idPedidoInsumo: null,
        idPedido: null,
        idInsumo: null,
        nomeInsumo: null,
        insInsumo: null,
        dataPedido: null,
        horaPedido: null,
        previsaoPedido: null,
        idFornecedor: null,
        nomeFornecedor: null,
        statusInsumo: null,
        chaveNF: null,
        quantidade: null,
        quantidadeConferida: null,
        dataEntradaValues: [],
        horaEntradaValues: [],
        quantidadeValues: [],
        entradas: [],
        queryParams: null,
        dynamicFieldsRendered: false,
        btnSalvarLoading: false
    }

    getInsumosEntrada = (pedido = 0, insumo = '') => {
        this.setState({tableLoading: true})
        let queryParams = ''
        if(pedido) queryParams += '&id='.pedido
        if(insumo) {
            if(!isNaN(insumo))
                queryParams += '&idPedidoInsumo='.insumo
            else
                queryParams += '&nomeInsumo='.insumo
        }
        axios
        .get(this.props.backEndPoint + '/getPedidosCompraInsumos?statusInsumo=S,E,C'+queryParams)
        .then(res => {
            if(res.data.payload){
                var tableData = [];
                res.data.payload.forEach(pedidoCompra => {
                    pedidoCompra.insumos.forEach(insumo =>{
                        var data_pedido = moment(pedidoCompra.data_pedido, 'YYYY-MM-DD')
                        var data_previsao = moment(pedidoCompra.data_previsao, 'YYYY-MM-DD')
                        tableData.push({
                            key: insumo.item,
                            id: pedidoCompra.id,
                            data_previsao: data_previsao.format('DD/MM/YYYY'),
                            data_pedido: data_pedido.format('DD/MM/YYYY'),
                            hora_pedido: pedidoCompra.hora_pedido,
                            chave_nf: pedidoCompra.chave_nf,
                            idfornecedor: pedidoCompra.idFornecedor,
                            fornecedorDescription: pedidoCompra.nomeFornecedor,
                            idInsumo: insumo.id,
                            nomeInsumo: insumo.nome,
                            insInsumo: insumo.ins,
                            quantidade: insumo.quantidade,
                            quantidade_conferida: insumo.quantidade_conferida,
                            statusInsumo: insumo.statusInsumo,
                            statusInsumoDescription: this.returnStatusDescription(insumo.statusInsumo,statusInsumoOption)
                        })
                    })
                })
                console.log(tableData);
                this.setState({tableData,queryParams})
            }
            else
                console.log('Nenhum registro encontrado')
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
            this.showNotification('Erro ao efetuar a operação! Tente novamente', false)
        })
    }

    showNotification = (msg, success) => {
        var type = null
        var style = null
        if(success){
            type = 'check-circle'
            style = {color: '#4ac955', fontWeight: '800'}
        }
        else {
            type = 'exclamation-circle'
            style = {color: '#f5222d', fontWeight: '800'}
        }
        const args = {
            message: msg,
            icon:  <Icon type={type} style={style} />,
            duration: 3
        }
        notification.open(args)
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    returnStatusDescription = (status, object) => {
        var returnStatus = '';
        if(object){
            object.forEach(objStatus => {
                if(objStatus.value === status) {
                    returnStatus = objStatus.description
                }
            });
        }
        return returnStatus;
    }

    loadArmazenagemModal = (record, modalEntradas = true) => {
        if(typeof(record) !== "undefined" && record.key) {
            this.setState({pedidoCompraId: record.key})
            axios
            .get(this.props.backEndPoint + '/getPedidoInsumoEntradas?id='+record.key)
            .then(res => {
                var entradas = [];
                var pedidoInsumoEntradas = res.data.payload;
                if(pedidoInsumoEntradas && pedidoInsumoEntradas.length === 1){
                    record.quantidade           = pedidoInsumoEntradas[0].quantidade
                    record.quantidadeConferida  = pedidoInsumoEntradas[0].quantidadeConferida
                    record.quantidadeArmazenada = pedidoInsumoEntradas[0].quantidadeArmazenada
                    entradas = pedidoInsumoEntradas[0].entradas;               
                }

                // Se não tiver entrada registrada, cria a primeira
                if(entradas.length === 0){
                    entradas.push({
                        data_entrada: moment(this.returnNowDate(), 'YYYY-MM-DD'),
                        hora_entrada: moment(this.returnNowHour(), 'HH:mm:ss'),
                        quantidades: 0
                    })
                }

                // Keys de entradas
                var keys = entradas.map((entradas, index) => {
                    return(index)
                })
                this.props.form.setFieldsValue({
                    keys
                })                  

                this.setState({
                    idPedidoInsumo: record.key,
                    idPedido: record.id,
                    nomeInsumo: record.nomeInsumo,
                    idInsumo: record.idInsumo,
                    insInsumo: record.insInsumo,
                    dataPedido: record.data_pedido,
                    horaPedido: record.hora_pedido,
                    previsaoPedido: record.data_previsao,
                    idFornecedor: record.idfornecedor,
                    nomeFornecedor: record.fornecedorDescription,
                    statusInsumo: record.statusInsumoDescription,
                    chaveNF: record.chave_nf,
                    quantidade: record.quantidade,
                    quantidadeConferida: record.quantidadeConferida,
                    quantidadeArmazenada: record.quantidadeArmazenada,
                    entradas: entradas,
                    dynamicFieldsRendered: true
                })
                if(modalEntradas){
                    this.showEntradaModal(true)
                    this.showEntradaModalStatus(false)
                } else {
                    this.showEntradaModal(false)
                    this.showEntradaModalStatus(true)
                }
            });
        } else {            
            if(modalEntradas)
                this.showEntradaModal(false)
            else
                this.showEntradaModalStatus(false)
        }
    }

    showEntradaModal = (showEntradaModal) => {
        let showSearchModal = false
        this.setState({showSearchModal, showEntradaModal})
    }

    showEntradaModalStatus = (showEntradaModalStatus) => {
        let showSearchModal = false
        this.setState({showSearchModal, showEntradaModalStatus})
    }

    showSearchModal = (showSearchModal) => {
        this.setState({showSearchModal})
    }    

    returnNowDate = () => {
        var date = new Date();
        return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
    }

    returnNowHour = () => {
        var date = new Date();
        return date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
    } 

    addComposicaoRow = () => {
        const { form } = this.props
        const keys = form.getFieldValue('keys')
        const nextKeys = keys.concat(id++)
        this.props.form.setFieldsValue({
            keys: nextKeys
        })
    }

    removeComposicaoRow = (k) => {
        const keys = this.props.form.getFieldValue('keys')
        if(keys.length === 1){
            return
        }

        // Atualizando quantidade total
        if(parseInt(this.props.form.getFieldValue(`quantidades[${k}]`)) >= 0){
            var quantidadeArmazenar = parseInt(this.state.quantidadeArmazenar) + parseInt(this.props.form.getFieldValue(`quantidades[${k}]`))
            this.setState({quantidadeArmazenar})
        }

        this.props.form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        })
    }

    componentDidMount(){
        this.getInsumosEntrada()
    }

    componentWillUpdate(){
        if(this.state.dynamicFieldsRendered){
            var data_entrada    = []
            var hora_entrada    = []
            var quantidades     = []

            this.state.entradas.forEach(insumo => {
                data_entrada.push(moment(insumo.data_entrada, 'YYYY-MM-DD'))
                hora_entrada.push(moment(insumo.hora_entrada, 'HH:mm:ss'))
                quantidades.push(insumo.quantidade)
            })

            // Atualizando id, que é a variável que controla o add e remove de campos
            id = (this.state.entradas.length)

            // Insere uma linha se não tiver entrada registrada
            // if(id === 0){
            //     this.addComposicaoRow();
            // }

            this.props.form.setFieldsValue({
                data_entrada,
                hora_entrada,
                quantidades
            })

            this.setState({dynamicFieldsRendered: false})
        }
    }

    handleOnChangeQuantidade = (e) => {
        let somatoria = 0
        const keys = this.props.form.getFieldValue('keys')
        keys.forEach(row => {
            somatoria += parseInt(this.props.form.getFieldValue(`quantidades[${row}]`))
        })
        this.setState({quantidadeConferida: isNaN(somatoria) ? 0 : somatoria})
    }    

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var entradas = []
                if(values.keys){
                    entradas = values.keys
                    .map((key, index) => {
                        return ({
                            id: this.state.entradas[index].id,
                            data_entrada: values.data_entrada[index],
                            hora_entrada: values.hora_entrada[index],
                            quantidade: parseInt(values.quantidades[index])
                        })
                    })
                    .filter(entrada => {
                        return entrada !== null
                    })
                }
                this.requestCreateUpdateArmazemEntrada({
                    idPedidoInsumo: this.state.idPedidoInsumo,
                    entradas: entradas
                })
            }
            else{
                console.log('erro no formulário')
                console.log(err);
            }
        })
    }

    handleSearchData = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                values.idPedidoBusca = (values.idPedidoBusca && values.idPedidoBusca !== 'undefined') ? values.idPedidoBusca : 0
                values.insumoBusca = (values.insumoBusca && values.insumoBusca !== 'undefined') ? values.insumoBusca : ''
                this.getInsumosEntrada(values.idPedidoBusca,values.insumoBusca)
            }
            else{
                this.showNotification('Erro ao buscar os dados! Tente novamente', false)
                console.log('erro no formulário')
                console.log(err)
            }
        })
    }

    requestCreateUpdateArmazemEntrada = (request) => {
        this.setState({btnSalvarLoading: true})
        axios.post(this.props.backEndPoint + '/createUpdatePedidoInsumoEntradas', request)
        .then(res => {
            console.log(res)
            if(res.data.success){
                this.showEntradaModal(false)
                this.getInsumosEntrada()
                this.setState({btnSalvarLoading: false})
            } else {
                this.setState({btnSalvarLoading: false})
                this.showNotification(res.data.msg, false)
            }
        })
        .catch(error =>{
            console.log(error)
            this.setState({btnSalvarLoading: false})
            this.showNotification('Erro ao efetuar a operação! Tente novamente', false)
        })
    }    

    handleQuantidadeValidator = (rule, value, callback) => {
        let key = rule.fullField.replace(/quantidades|\[|\]/gi,'');
        key = key && !isNaN(key) ? parseInt(key) : 0
        if(key && !isNaN(key)){
            value = value && !isNaN(value) ? parseFloat(value) : 0
            let conferido = this.state.quantidadeConferida;
            let armazenado = this.state.quantidadeArmazenada;

            let error = false;

            // Valida conferido
            conferido = conferido && !isNaN(conferido) ? parseFloat(conferido) : 0
            if (conferido > 0 && value > 0 && value < conferido) {            
                error = true;
                this.showNotification('Não é permitida quantidade superior a do Pedido de Compra', false)
            }

            // Valida armazenado
            armazenado = armazenado && !isNaN(armazenado) ? parseFloat(armazenado) : 0
            if (armazenado > 0 && value > 0 && value < armazenado) {            
                error = true;
                this.showNotification('Não é permitida quantidade inferior à Armazenada', false)
            }
            
            if(error) callback('Qtde inválida!')
        }
        callback()
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')

        const formHorizontal = {
            labelCol: { span: 4 },
            wrapperCol: { span: 14 },
        }

        const entradaRow = keys.map(k => (
            <Row key={k} gutter={5} style={{marginBottom: '15px'}}>
                <Col span={7} id="colData" style={{position: 'relative'}}>
                    <Form.Item style={{paddingBottom: '0px', marginBottom: '0px'}}>
                        {getFieldDecorator(`data_entrada[${k}]`, {
                            initialValue: moment(this.returnNowDate(), 'YYYY-MM-DD'),
                            rules: [{
                                required: true, message: "Informe a Data"
                            }],
                        })(
                            <DatePicker
                                locale={ptBr}
                                format="DD/MM/YYYY"
                                placeholder="Selecione a data"
                                style={ {width: '100%'} }
                                getCalendarContainer={() => document.getElementById('colData')}
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={7} id="colHora" style={{position: 'relative'}}>
                    <Form.Item style={{paddingBottom: '0px', marginBottom: '0px'}}>
                        {getFieldDecorator(`hora_entrada[${k}]`, {
                            initialValue: moment(this.returnNowHour(), 'HH:mm:ss'),
                            rules: [{
                                required: true, message: "Informe a Hora"
                            }],
                        })(
                            <TimePicker
                                locale={ptBr}
                                format="HH:mm:ss"
                                placeholder="Selecione a hora"
                                style={ {width: '100%'} }
                                getCalendarContainer={() => document.getElementById('colHora')}
                            />                            
                        )}
                    </Form.Item>
                </Col>
                <Col span={8} id="colQuantidade" style={{position: 'relative'}}>
                    <Form.Item style={{paddingBottom: '0px', marginBottom: '0px'}}>
                        {getFieldDecorator(`quantidades[${k}]`, {
                            initialValue: '0',
                            rules: [
                                {
                                    required: true, message: 'Informe a quantidade',
                                },
                                {
                                    validator: this.handleQuantidadeValidator
                                }
                            ]
                        })(
                            <Input
                                id="quantidade"
                                placeholder="Quantidade"
                                onKeyUp={this.handleOnChangeQuantidade}
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={1} id="colDelete" style={{position: 'relative'}}>
                    <Form.Item style={{paddingBottom: '0px', marginBottom: '0px', marginTop: '4px', textAlign: 'center'}}>
                        {keys.length > 1 ? (
                            <Icon
                                className="dynamic-delete-button"
                                type="minus-circle-o"
                                disabled={keys.length === 1}
                                onClick={() => this.removeComposicaoRow(k)}
                            />
                        ) : null}
                    </Form.Item>
                </Col>                  
            </Row>
        ))
        
        const columns = [{
            title: 'Pedido',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Data Pedido',
            dataIndex: 'data_pedido',
            sorter: (a, b) => this.compareByAlph(a.data_pedido, b.data_pedido)
        },
        {
            title: 'Fornecedor',
            dataIndex: 'fornecedorDescription',
            sorter: (a, b) => this.compareByAlph(a.fornecedorDescription, b.fornecedorDescription)
        },
        {
            title: 'Chave N.F',
            dataIndex: 'chave_nf',
            sorter: (a, b) => this.compareByAlph(a.chave_nf, b.chave_nf)
        },             
        {
            title: 'Insumo',
            dataIndex: 'nomeInsumo',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.nomeInsumo, b.nomeInsumo)
        },
        {
            title: 'Quantidade',
            dataIndex: 'quantidade',
            align: 'center',
            sorter: (a, b) => a.quantidade - b.quantidade,
        },
        {
            title: 'Status',
            dataIndex: 'statusInsumoDescription',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.statusInsumoDescription, b.statusInsumoDescription)
        },        
        {
            title: 'Operação',
            colSpan: 2,
            dataIndex: 'operacao',
            align: 'center',
            width: 150,
            render: (text, record) => {
                return(
                    <React.Fragment>
                        <Icon type="edit" style={{cursor: 'pointer'}} title="Incluir ou Alterar Entradas" alt="Incluir ou Alterar Entradas" onClick={() => this.loadArmazenagemModal(record, true)} />
                        <Icon type="redo" style={{cursor: 'pointer', marginLeft: 20}} title="Alterar Status do Insumo" title="Alterar Status do Insumo" onClick={() => this.loadArmazenagemModal(record, false)} />
                    </React.Fragment>
                )
            }
        }]

        return(
            <React.Fragment>                                    
                <h3>Entrada de Insumos</h3>                    
                <Row style={{marginTop: 30}}>
                    <Col span={4} offset={20} style={{textAlign: 'right'}}>
                        <Button type="primary" size="small" icon="search" title="Clique para filtar os insumos desejados" onClick={() => this.showSearchModal(true)}>
                            Buscar Insumos
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Table
                            columns={columns}
                            dataSource={this.state.tableData}
                            loading={this.state.tableLoading}
                            rowKey='key'
                        />
                    </Col>
                </Row>
                <Modal
                    title="Busca de Insumos"
                    visible={this.state.showSearchModal}
                    onCancel={() => this.showSearchModal(false)}
                    width={600}
                    footer={[
                        <Button key="back" onClick={() => this.showSearchModal(false)}><Icon type="close" /> Fechar</Button>,
                        <Button key="submit" type="primary" loading={this.state.btnSalvarLoading} onClick={() => this.handleSearchData()}><Icon type="search" /> Buscar</Button>
                    ]}
                >
                    {this.state.showSearchModal ? (
                        <Form layout='horizontal'>                            
                            <Form.Item label="#Pedido" {...formHorizontal}>
                                {getFieldDecorator('idPedidoBusca')(
                                    <Input
                                        id="idPedidoBusca"
                                        placeholder="Código do Pedido"
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label="Insumo" {...formHorizontal}>
                                {getFieldDecorator('insumoBusca')(
                                    <Input
                                        id="insumoBusca"
                                        placeholder="Código ou nome do insumo"
                                    />
                                )}
                            </Form.Item>                            
                            {/* <Form.Item label="Status" id="colStatusInsumoBusca" {...formHorizontal}>
                                {getFieldDecorator('statusInsumo')(
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="Selecione"
                                        allowClear={true}
                                    >
                                        {
                                            statusInsumoOption.map((option) => {
                                                return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>                           */}
                        </Form>
                    ) : null}
                </Modal>                
                <Modal
                    title="Entrada de Insumos"
                    visible={this.state.showEntradaModal}
                    onCancel={() => this.showEntradaModal(false)}
                    width={600}
                    footer={[
                        <Button key="back" onClick={() => this.showEntradaModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.btnSalvarLoading} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    {this.state.showEntradaModal ? ( 
                        <Form layout="vertical">
                            <Row>
                                <Col span={19} id="colInsumo" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="Insumo"
                                    >
                                    {this.state.idInsumo + ' - ' + this.state.nomeInsumo}
                                    </Form.Item>
                                </Col>
                                <Col span={5} id="colInsInsumo" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="INS"
                                    >
                                    {this.state.insInsumo}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12} id="colFornecedor" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="Fornecedor"
                                    >
                                    {this.state.idFornecedor + ' - ' + this.state.nomeFornecedor}
                                    </Form.Item>
                                </Col>
                                <Col span={7} id="colChaveNF" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="Chave N.F"
                                    >
                                    {this.state.chaveNF}
                                    </Form.Item>
                                </Col>
                                <Col span={5} id="colStatusInsumo" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="Status"
                                        style={{paddingBottom: '0px', marginBottom: '0px'}}
                                    >
                                    {this.state.statusInsumo}
                                    </Form.Item>
                                </Col>                            
                            </Row>
                            <Row>
                                <Col span={8} id="colQuantidade" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="Quantidade"
                                        style={{paddingBottom: '0px', marginBottom: '0px'}}
                                    >
                                    {this.state.quantidade}
                                    </Form.Item>
                                </Col>
                                <Col span={8} id="colQuantidadeConferida" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="Quantidade Conferida"
                                        style={{paddingBottom: '0px', marginBottom: '0px'}}
                                    >
                                    {this.state.quantidadeConferida}
                                    </Form.Item>
                                </Col>
                                <Col span={8} id="colQuantidadeArmazenada" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="Quantidade Armazenada"
                                        style={{paddingBottom: '0px', marginBottom: '0px'}}
                                    >
                                    {this.state.quantidadeArmazenada}
                                    </Form.Item>
                                </Col>                        
                            </Row>
                            <Divider />
                            <h4>Entrada de Insumos (Matérias-Primas)</h4>                          
                            {
                                entradaRow.length > 0 ?
                                <Row className="bold" style={{marginBottom: 10}}>
                                    <Col span={7}>Data</Col>
                                    <Col span={7}>Hora</Col>
                                    <Col span={8}>Quantidade</Col>
                                </Row>
                                :null
                            }                        
                            {entradaRow}
                            <Row>
                                <Col span={24}>
                                    <Button key="primary" title="Nova Entrada" onClick={this.addComposicaoRow}><Icon type="plus" /></Button>
                                </Col>
                            </Row>                        
                        </Form>
                    ) : null}
                </Modal>
                <Modal
                    title="Atualização de Status do Insumos"
                    visible={this.state.showEntradaModalStatus}
                    onCancel={() => this.showEntradaModalStatus(false)}
                    width={600}
                    footer={[
                        <Button key="back" onClick={() => this.showEntradaModalStatus(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.btnSalvarLoading} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    {this.state.showEntradaModalStatus ? (
                        <Form layout="vertical">
                            <Row>
                                <Col span={16} id="colInsumo" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="Insumo"
                                    >
                                    {this.state.nomeInsumo}
                                    </Form.Item>
                                </Col>
                                <Col span={5} id="colInsInsumo" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="INS"
                                    >
                                    {this.state.insInsumo}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={16} id="colFornecedor" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="Fornecedor"
                                    >
                                    {this.state.nomeFornecedor}
                                    </Form.Item>
                                </Col>
                                <Col span={8} id="colChaveNF" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="Chave N.F"
                                    >
                                    {this.state.chaveNF}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={8} id="colQuantidade" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="Quantidade"
                                    >
                                    {this.state.quantidade}
                                    </Form.Item>
                                </Col>
                                <Col span={8} id="colQuantidadeConferida" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="Quantidade Conferida"
                                    >
                                    {this.state.quantidadeConferida}
                                    </Form.Item>
                                </Col>
                                <Col span={8} id="colStatusInsumo" style={{position: 'relative'}}>
                                    <Form.Item
                                        label="Status"
                                    >
                                        {getFieldDecorator('statusInsumo', {
                                            rules: [
                                                {
                                                    required: true, message: 'Por favor selecione',
                                                }
                                            ]
                                        })(
                                            <Select
                                                style={{ width: '100%' }}
                                                placeholder="Selecione"
                                                getPopupContainer={() => document.getElementById('colStatusInsumo')}
                                                allowClear={true}
                                            >
                                                {
                                                    statusInsumoOption.map((option) => {
                                                        return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    ) : null}
                </Modal>            
            </React.Fragment>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(ArmazemEntrada))