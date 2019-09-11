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

class LinhasDeProducao extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Linhas de Produção')
    }

    state = {
        linhaDeProducaoId: null,
        tableData: [],
        showLinhasDeProducaoModal: false,
        tableLoading: false,
        buttonSalvarLinhaDeProducao: false,
        setoresOptions: [],
        setoresSelectStatus: {
            placeholder: 'Carregando...',
            disabled: false
        },
        dynamicFieldsRendered: false,
        setores: []
    }

    requestGetLinhasDeProducao = () => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/getLinhasDeProducao')
        .then(res => {
            if(res.data.payload){
                var tableData = res.data.payload.map(linhaDeProducao => {
                    var ativo = linhaDeProducao.ativo === 'Y' ? 'Sim' : 'Não'
                    return({
                        key: linhaDeProducao.id,
                        nome: linhaDeProducao.nome,
                        ativoValue: linhaDeProducao.ativo,
                        ativoDescription: ativo,
                        setorValue: linhaDeProducao.idSetor,
                        setorDescription: linhaDeProducao.nomeSetor,
                        setores: linhaDeProducao.setores
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

    requestCreateUpdateLinhaDeProducao = (request) => {
        this.setState({buttonSalvarLinhaDeProducao: true})
        axios.post(this.props.backEndPoint + '/createUpdateLinhaDeProducao', request)
        .then(res => {
            this.showLinhasDeProducaoModal(false)
            this.requestGetLinhasDeProducao()
            this.setState({buttonSalvarLinhaDeProducao: false})
        })
        .catch(error =>{
            console.log(error)
            this.setState({buttonSalvarLinhaDeProducao: false})
        })
    }

    showLinhasDeProducaoModal = (showLinhasDeProducaoModal) => {
        // Se estiver fechando
        if(!showLinhasDeProducaoModal){
            this.props.form.resetFields()
            this.setState({linhaDeProducaoId: null})
        }
        this.setState({showLinhasDeProducaoModal})
    }

    loadLinhasDeProducaoModal = (record) => {
        this.loadSetoresOptions()
        if(typeof(record) !== "undefined") {
            // Edit
            var keys = record.setores.map((setor, index) => {
                return(index)
            })

            this.props.form.setFieldsValue({
                nome: record.nome,
                ativo: record.ativoValue,
                setor: record.setorValue,
                keys
            })

            this.setState({
                linhaDeProducaoId: record.key,
                dynamicFieldsRendered: true,
                setores: record.setores
            })
        }
        else{
            this.props.form.setFieldsValue({
                ativo: 'Y'
            })
        }
        this.showLinhasDeProducaoModal(true)
    }

    componentWillUpdate(){
        if(this.state.dynamicFieldsRendered){

            var setores = this.state.setores.map(setor => {
                return(setor.id)
            })
            var setoresOrdem = this.state.setores.map(setor => {
                return(setor.ordem)
            })

            // Atualizando id, que é a variável que controla o add e remove de campos
            id = (this.state.setores.length)

            this.props.form.setFieldsValue({
                setores,
                setoresOrdem
            })

            this.setState({dynamicFieldsRendered: false})
        }
    }

    handleDeleteLinhaDeProducao = (id) => {
        this.setState({tableLoading: true})
        axios
        .get(this.props.backEndPoint + '/deleteLinhaDeProducao?id='+id)
        .then(res => {
            this.requestGetLinhasDeProducao()
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
                var id = this.state.linhaDeProducaoId ? this.state.linhaDeProducaoId : null

                var setores = null
                if(values.setores){
                    setores = values.setores
                    .map((setor, index) => {
                        return ({
                            id: setor,
                            ordem: values.setoresOrdem[index]
                        })
                    })
                    .filter(setor => {
                        return setor !== null
                    })
                }

                var request = {
                    id: id,
                    nome: values.nome,
                    ativo: values.ativo,
                    setores: setores
                }
                this.requestCreateUpdateLinhaDeProducao(request)
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    componentWillMount(){
        this.requestGetLinhasDeProducao()
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')
        const composicaoItems = keys.map((k, index) => (
                <Row key={k} gutter={5}>
                    <Col span={18}>
                        <Form.Item>
                            {getFieldDecorator(`setores[${k}]`, {
                                rules: [{
                                    required: true, message: "Informe o subproduto"
                                }],
                            })(
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    style={{ width: '100%' }}
                                    placeholder={this.state.setoresSelectStatus.placeholder}
                                    disabled={this.state.setoresSelectStatus.disabled}
                                    getPopupContainer={() => document.getElementById('colCadastroLinhasDeProducao')}
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
                    </Col>
                    <Col span={6}>
                        <Form.Item>
                            {getFieldDecorator(`setoresOrdem[${k}]`, {
                                rules: [{
                                    required: true, message: "Informe a ordem"
                                }],
                            })(
                                <Input
                                    style={{ width: '75%', marginRight: 8 }}
                                    placeholder="Ordem"
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
                        <Icon type="edit" style={{cursor: 'pointer'}} onClick={() => this.loadLinhasDeProducaoModal(record)} />
                        <Popconfirm title="Confirmar remoção?" onConfirm={() => this.handleDeleteLinhaDeProducao(record.key)}>
                            <a href="/admin/cadastros/linhas-de-producao" style={{marginLeft: 20}}><Icon type="delete" style={{color: 'red'}} /></a>
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
                        <Tooltip title="Cadastrar Nova Linha de Produção" placement="right">
                            <Button className="buttonGreen" onClick={() => this.loadLinhasDeProducaoModal()}><Icon type="plus" /> Nova Linha de Produção</Button>
                        </Tooltip>
                    </Col>
                </Row>
                
                <Table
                    columns={columns}
                    dataSource={this.state.tableData}
                    loading={this.state.tableLoading}
                />
                <Modal
                    title="Cadastro de Linhas de Producao"
                    visible={this.state.showLinhasDeProducaoModal}
                    onCancel={() => this.showLinhasDeProducaoModal(false)}
                    footer={[
                        <Button key="back" onClick={() => this.showLinhasDeProducaoModal(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.buttonSalvarLinhaDeProducao} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Row>
                        <Col span={24} id="colCadastroLinhasDeProducao" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                <Form.Item
                                    label="Nome"
                                >
                                    {getFieldDecorator('nome', {
                                        rules: [
                                            {
                                                required: true, message: 'Por favor informe o nome da linha de produção',
                                            }
                                        ]
                                    })(
                                        <Input
                                            id="nome"
                                            placeholder="Digite o nome da linha de produção"
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
                                            showSearch
                                            optionFilterProp="children"
                                            style={{ width: '100%' }}
                                            placeholder="Selecione"
                                            getPopupContainer={() => document.getElementById("colCadastroLinhasDeProducao")}
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
                                <Divider />
                                <h4>Composição da Linha de Produção</h4>
                                {composicaoItems}
                                <Row>
                                    <Col span={24}>
                                        <Button key="primary" title="Novo setor" onClick={this.addComposicaoRow}><Icon type="plus" /></Button>
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

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(LinhasDeProducao))