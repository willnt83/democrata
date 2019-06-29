import React, { Component } from 'react'
import { Layout, Table, Icon, Popconfirm, Modal, Input, Button, Row, Col, Form, Select, Divider } from 'antd'
import { Tooltip } from '@material-ui/core/'
import { connect } from 'react-redux'
import axios from "axios"

const { Content } = Layout

let id = 0

const ativoOptions = [
    {value: 'Y', description: 'Sim'},
    {value: 'N', description: 'Não'}
]

class Conjuntos extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Conjuntos')
    }

    state = {
        conjuntoId: null,
        tableData: [],
        showConjuntosModal: false,
        tableLoading: false,
        buttonSalvarConjunto: false,
        setoresOptions: [],
        subprodutosOptions: [],
        setoresSelectStatus: {
            placeholder: 'Carregando...',
            disabled: false
        },
        subprodutosSelectStatus: {
            placeholder: 'Carregando...',
            disabled: true
        },
        dynamicFieldsRendered: false,
        subprodutos: []
    }

    requestGetConjuntos = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getConjuntos')
        .then(res => {
            if(res.data.payload){
                console.log('res.data.payload', res.data.payload)
                var tableData = res.data.payload.map(conjunto => {
                    var ativo = conjunto.ativo === 'Y' ? 'Sim' : 'Não'
                    return({
                        key: conjunto.id,
                        nome: conjunto.nome,
                        ativoValue: conjunto.ativo,
                        ativoDescription: ativo,
                        setorValue: conjunto.idSetor,
                        setorDescription: conjunto.nomeSetor,
                        subprodutos: conjunto.subprodutos
                    })
                })
                this.setState({tableData})
            }
            else
                console.log('Nenhum registro encontrado')
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    loadSetoresOptions = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getSetores?ativo=Y')
        .then(res => {
            if(res.data.payload){
                this.setState({
                    setoresOptions: res.data.payload.map(setor => {
                        return({
                            value: setor.id,
                            description: setor.nome
                        })
                    }),
                    setoresSelectStatus: {
                        placeholder: 'Selecione o setor',
                        disabled: false
                    }
                })
            }
            else
                console.log('Nenhum registro de setor encontrado')
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    loadSubprodutosOptions = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getSubprodutos?ativo=Y')
        .then(res => {
            if(res.data){
                this.setState({
                    subprodutosOptions: res.data.payload.map(subproduto => {
                        return({
                            value: subproduto.id,
                            description: subproduto.nome,
                        })
                    }),
                    subprodutosSelectStatus: {
                        placeholder: 'Selecione o subproduto',
                        disabled: false
                    }
                })
            }
            else{
                console.log('Nenhum registro encontrado')
            }
            this.setState({tableLoading: false})
        })
        .catch(error => {
            console.log(error)
            this.setState({tableLoading: false})
        })
    }

    requestCreateUpdateConjunto = (request) => {
        this.setState({buttonSalvarConjunto: true})
        axios.post(this.props.backEndPoint + '/createUpdateConjunto', request)
        .then(res => {
            this.showConjuntosModal(false)
            this.requestGetConjuntos()
            this.setState({buttonSalvarConjunto: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarConjunto: false})
        })
    }

    showConjuntosModal = (showConjuntosModal) => {
        // Se estiver fechando
        if(!showConjuntosModal){
            this.props.form.resetFields()
            this.setState({conjuntoId: null})
        }
        this.setState({showConjuntosModal})
    }

    loadConjuntosModal = (record) => {
        this.loadSetoresOptions()
        this.loadSubprodutosOptions()
        if(typeof(record) !== "undefined") {
            // Edit
            var keys = record.subprodutos.map((subproduto, index) => {
                return(index)
            })

            this.props.form.setFieldsValue({
                nome: record.nome,
                ativo: record.ativoValue,
                setor: record.setorValue,
                keys
            })

            this.setState({
                conjuntoId: record.key,
                dynamicFieldsRendered: true,
                subprodutos: record.subprodutos
            })
        }
        else{
            this.props.form.setFieldsValue({
                ativo: 'Y'
            })
        }
        this.showConjuntosModal(true)
    }

    componentWillUpdate(){
        if(this.state.dynamicFieldsRendered){

            var subprodutos = this.state.subprodutos.map(subproduto => {
                return(subproduto.id)
            })
            var subprodutosQtde = this.state.subprodutos.map(subproduto => {
                return(subproduto.quantidade)
            })
            var subprodutosPontos = this.state.subprodutos.map(subproduto => {
                return(subproduto.pontos)
            })

            // Atualizando id, que é a variável que controla o add e remove de campos
            id = (this.state.subprodutos.length)

            this.props.form.setFieldsValue({
                subprodutos,
                subprodutosQtde,
                subprodutosPontos
            })

            this.setState({dynamicFieldsRendered: false})
        }
    }

    handleDeleteConjunto = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deleteConjunto?id='+id)
        .then(res => {
            this.requestGetConjuntos()
        })
        .catch(error => {
            console.log(error)
        })
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    addComposicaoRow = () => {
        const { form } = this.props
        const keys = form.getFieldValue('keys')
        const nextKeys = keys.concat(id++)

        form.setFieldsValue({
            keys: nextKeys,
        })
    }

    removeComposicaoRow = (k) => {
        const { form } = this.props
        // can use data-binding to get
        const keys = form.getFieldValue('keys')
        // We need at least one passenger
        if (keys.length === 1){
            return
        }

        // can use data-binding to set
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        })
    }

    handleFormSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var id = this.state.conjuntoId ? this.state.conjuntoId : null

                var subprodutos = null
                if(values.subprodutos){
                    subprodutos = values.subprodutos
                    .map((subproduto, index) => {
                        return ({
                            id: subproduto,
                            quantidade: parseInt(values.subprodutosQtde[index]),
                            pontos: parseFloat(values.subprodutosPontos[index])
                        })
                    })
                    .filter(subproduto => {
                        return subproduto !== null
                    })
                }

                var request = {
                    id: id,
                    nome: values.nome,
                    ativo: values.ativo,
                    setor: values.setor,
                    subprodutos: subprodutos
                }
                this.requestCreateUpdateConjunto(request)
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    componentWillMount(){
        this.requestGetConjuntos()
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')
        const composicaoItems = keys.map((k, index) => (
            <Row key={k} gutter={5}>
                <Col span={14} id="subprodutos" style={{position: 'relative'}}>
                    <Form.Item>
                        {getFieldDecorator(`subprodutos[${k}]`, {
                            rules: [{
                                required: true, message: "Informe o subproduto"
                            }],
                        })(
                            <Select
                                style={{ width: '100%' }}
                                placeholder={this.state.subprodutosSelectStatus.placeholder}
                                disabled={this.state.subprodutosSelectStatus.disabled}
                                getPopupContainer={() => document.getElementById('subprodutos')}
                                allowClear={true}
                            >
                                {
                                    this.state.subprodutosOptions.map((option) => {
                                        return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                    })
                                }
                            </Select>
                        )}
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Form.Item>
                        {getFieldDecorator(`subprodutosQtde[${k}]`, {
                            rules: [{
                                required: true, message: "Informe a quantidade"
                            }],
                        })(
                            <Input
                                style={{ width: '100%' }}
                                placeholder="Qtd"
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item>
                        {getFieldDecorator(`subprodutosPontos[${k}]`)(
                            <Input
                                style={{ width: '75%', marginRight: 8 }}
                                placeholder="Pontos"
                                title="Quantidade de pontos por unidade produzida"
                            />
                        )}
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
            title: 'ID',
            dataIndex: 'key',
            sorter: (a, b) => a.key - b.key,
        },
        {
            title: 'Descrição',
            dataIndex: 'nome',
            sorter: (a, b) => this.compareByAlph(a.nome, b.nome)
        },
        {
            title: 'Setor',
            dataIndex: 'setorDescription',
            align: 'center',
            sorter: (a, b) => this.compareByAlph(a.setorDescription, b.setorDescription)
        },
        {
            title: 'Ativo',
            dataIndex: 'ativoDescription',
            align: 'center',
            width: 150,
            filters: [{
                text: 'Ativo',
                value: 'Ativo',
            }, {
                text: 'Inativo',
                value: 'Inativo',
            }],
            filterMultiple: false,
            onFilter: (value, record) => record.ativo.indexOf(value) === 0
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
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadConjuntosModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteConjunto(record.key)}>
                            <a href="/admin/cadastros/conjuntos" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
                        </Popconfirm>
                    </React.Fragment>
                )
            }
        }]

        return(
            <Content
                style={{
                    margin: "24px 16px",
                    padding: 24,
                    background: "#fff",
                    minHeight: 280
                }}
            >

                <Row style={{ marginBottom: 16 }}>
                    <Col span={24} align="end">
                        <Tooltip title="Cadastrar Novo Conjunto" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadConjuntosModal()}><Icon type="plus" /> Novo Conjunto</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Conjuntos"
                    visible={this.state.showConjuntosModal}
                    onCancel={() => this.showConjuntosModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showConjuntosModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarConjunto} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Row>
                        <Col span={24} id="colCadastroDeConjuntos" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                <Form.Item
                                    label="Nome"
                                >
                                    {getFieldDecorator('nome', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o nome do conjunto',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="nome"
                                            placeholder="Digite o nome do conjunto"
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item label="Ativo">
                                    {getFieldDecorator('ativo', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor selecione',
                                            }
                                        ]
                                    })(
                                        <Select
                                            style={{ width: '100%' }}
                                            placeholder="Selecione"
                                            getPopupContainer={() => document.getElementById('colCadastroDeConjuntos')}
                                            allowClear={true}
                                        >
                                            {
                                                ativoOptions.map((option) => {
                                                    return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                                <Form.Item label="Setor">
                                    {getFieldDecorator('setor', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor selecione o setor',
                                            }
                                        ]
                                    })(
                                        <Select
                                            style={{ width: '100%' }}
                                            placeholder={this.state.setoresSelectStatus.placeholder}
                                            disabled={this.state.setoresSelectStatus.disabled}
                                            getPopupContainer={() => document.getElementById('colCadastroDeConjuntos')}
                                            allowClear={true}
                                        >
                                            {
                                                this.state.setoresOptions.map((option) => {
                                                    return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                                <Divider />
                                <h4>Composição do Conjunto</h4>
                                {composicaoItems}
                                <Row>
                                    <Col span={24}>
                                        <Button key="primary" title="Novo conjunto" onClick={this.addComposicaoRow}><Icon type="plus" /></Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Col>
                    </Row>
                </Modal>
          </Content>
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(Conjuntos))