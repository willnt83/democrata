import React, { Component } from 'react'
import { Row, Col, Form, Modal, Button, Divider, Input, Select, Icon } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import BarcodeReader from 'react-barcode-reader'


class ModalAlteracaoEndereco extends Component{
    constructor(props){
        super(props)
        this.state = {
            barcodeReader: false,
            lancamentoManual: false,
            produtoArmazenado: null,
            almoxarifadosOptions: [],
            posicoesOptions: [],
            btnLoadingBuscarProduto: false,
            btnLoadingAlterarEndereco: false,
            processando: false
        }
        this.handleScan = this.handleScan.bind(this)
    }


    handleScan = (data) => {
        if(!this.state.processando){
            var dataArr = data.split('-')
            if(parseInt(dataArr[3]) !== 8 || dataArr.length < 6)
                this.props.showNotification('Código de barras inválido', false)
            else{
                this.requestGetProdutoArmazenadoInfo(data)
            }
        }
        else
            this.props.showNotification('Aguarde a alteração ser processada', false)
    }

    handleError(err){
        console.error(err)
    }

    requestGetAlmoxarifados = () => {
        axios.get(this.props.backEndPoint + '/wms-produtos/getAlmoxarifados')
        .then(res => {
            if(res.data.payload){
                this.setState({almoxarifadosOptions: res.data.payload})
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    handleAlterarProduto = () => {
        this.setState({
            produtoArmazenado: null
        })
    }

    handleChangeAlmoxarifado = (value, e) => {
        console.log('handleChangeAlmoxarifado')
        // Reset na posição

        this.setState({
            posicoesOptions: []
        })
        this.props.form.setFieldsValue({posicao: null})
        this.requestGetPosicaoArmazem(value)
    }

    requestGetPosicaoArmazem = (idAlmoxarifado) => {
        axios.get(this.props.backEndPoint + '/wms-produtos/getPosicoes?id_almoxarifado='+idAlmoxarifado)
        .then(res => {
            if(res.data.payload){
                this.setState({posicoesOptions: res.data.payload})
            }
            else{
                console.log('Nenhum registro encontrado')
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    lancamentoManual = (bool) => {
        this.setState({lancamentoManual: bool})
    }

    lancarManual = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                var dataArr = values.produtoBarcode.split('-')
               
                if(parseInt(dataArr[3]) !== 8 || dataArr.length < 6)
                    this.props.showNotification('Código de barras inválido', false)
                else{
                    this.setState({ btnLoadingBuscarProduto: true})
                    this.requestGetProdutoArmazenadoInfo(values.produtoBarcode)
                }
            }
        })
    }

    requestGetProdutoArmazenadoInfo = (codigo) => {
        axios.get(this.props.backEndPoint + '/wms-produtos/getProdutoArmazenadoInfo?codigo='+codigo)
        .then(res => {
            if(res.data.success){
                this.setState({produtoArmazenado: res.data.payload, btnLoadingBuscarProduto: false})
            }
            else
                this.props.showNotification(res.data.msg, res.data.success)
        })
        .catch(error => {
            console.log(error)
        })
    }

    buildRequest = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            this.setState({btnLoadingAlterarEndereco: true})
            if(!err){
                var request = {
                    idArmazenagemProduto: this.state.produtoArmazenado.idArmazenagemProduto,
                    idAlmoxarifado: values.almoxarifado,
                    idPosicao: values.posicao
                }

                this.requestAlteracaoEndereco(request)
            }
        })
    }

    requestAlteracaoEndereco = (request) => {
        axios.post(this.props.backEndPoint + '/wms-produtos/alteracaoEndereco', request)
        .then(res => {
            this.props.showNotification(res.data.msg, res.data.success)
            if(res.data.success){
                this.setState({produtoArmazenado: null})
            }
            this.setState({btnLoadingAlterarEndereco: false, processando: false})
        })
        .catch(error => {
            this.setState({buttonArmazenar: false})
            console.log(error)
        })
    }

    closeModal = () => {
        this.setState({
            barcodeReader: false,
            lancamentoManual: false

        })
        this.props.showModalAlteracaoEnderecoF(false)
    }

    componentWillReceiveProps(nextProps){
        // Modal aberto
        if(!this.props.showModalAlteracaoEndereco && nextProps.showModalAlteracaoEndereco){
            this.setState({barcodeReader: true})
        }
    }

    componentDidMount(){
        this.requestGetAlmoxarifados()
    }

    render(){
        const { getFieldDecorator } = this.props.form

        const inputLancamentoManual =
            <React.Fragment>
                <Form.Item label="Código de Barras do Produto">
                    {getFieldDecorator('produtoBarcode')(
                        <Input
                            id="produtoBarcode"
                        />
                    )}
                </Form.Item>
                <Button onClick={this.lancarManual} loading={this.state.btnLoadingBuscarProduto}>Buscar</Button>
            </React.Fragment>
        return(
            <Modal
                title="Alteração de Endereço"
                visible={this.props.showModalAlteracaoEndereco}
                onCancel={this.closeModal}
                maskClosable={false}
                footer={[
                    <Button type="primary" key="back" onClick={this.closeModal}><Icon type="close" /> Fechar</Button>
                ]}
            >
            {
                this.state.produtoArmazenado === null ?
                <Row>
                    <Col span={24} id="colAlteracaoEndereco" style={{position: 'relative'}}>
                        {
                            this.state.barcodeReader ?
                            <BarcodeReader
                                onError={this.handleError}
                                onScan={this.handleScan}
                            />
                            :null
                        }

                        <Form layout="vertical">
                            <React.Fragment>
                                <Row style={{marginBottom: 10}}>
                                    {
                                        !this.state.lancamentoManual ?
                                        <Col span={24} onClick={() => this.lancamentoManual(true)} style={{textAlign: 'right', cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>
                                            Lançamento Manual
                                        </Col>
                                        :
                                        <Col span={24} onClick={() => this.lancamentoManual(false)} style={{textAlign: 'right', cursor: 'pointer', color: '#3c3fe0', textDecoration: 'underline'}}>
                                            Código de Barras
                                        </Col>
                                    }
                                </Row>
                                <Row>
                                    {
                                        !this.state.lancamentoManual ?
                                        <Col span={24}><span className="bold">Aguardando leitura do código de barras do produto...</span></Col>
                                        :
                                        <Col span={24}>
                                            {inputLancamentoManual}
                                        </Col>
                                    }
                                </Row>
                            </React.Fragment>
                        </Form>
                    </Col>
                </Row>
                :
                <Row>
                    <Col span={24} id="colAlteracaoEndereco" style={{position: 'relative'}}>
                        <Row>
                            <Col span={16}>
                                <Row>
                                    <Col span={24}><span className="bold">Produto:</span> {this.state.produtoArmazenado.produto.nome}</Col>
                                    <Col span={24}><span className="bold">Posição Atual:</span> {this.state.produtoArmazenado.almoxarifado.nome} - {this.state.produtoArmazenado.posicao.nome}</Col>
                                </Row>
                            </Col>
                            <Col span={8} style={{textAlign: 'right'}}>
                                <Button className="buttonPurple" onClick={this.handleAlterarProduto}><Icon type="redo" /> Alterar Produto</Button>
                            </Col>
                            
                            <Divider style={{marginTop: 60, marginBottom: 16}} />
                            <Col span={24} className="bold" style={{marginBottom: 10}}>Nova Posição</Col>
                            <Col span={24}>
                                <Form layout="vertical">
                                    <Form.Item label="Almoxarifado">
                                        {getFieldDecorator('almoxarifado', {
                                            rules: [
                                                {
                                                    required: true, message: 'Por favor selecione o almoxarifado',
                                                }
                                            ]
                                        })(
                                            <Select
                                                showSearch
                                                optionFilterProp="children"
                                                style={{ width: '100%' }}
                                                placeholder="Selecione"
                                                getPopupContainer={() => document.getElementById('colAlteracaoEndereco')}
                                                allowClear={true}
                                                onChange={(value, e) => this.handleChangeAlmoxarifado(value, e)}
                                            >
                                                {
                                                    this.state.almoxarifadosOptions.map((option) => {
                                                        return (<Select.Option key={option.id} value={option.id}>{option.nome}</Select.Option>)
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>

                                    <Form.Item label="Posição">
                                        {getFieldDecorator('posicao', {
                                            rules: [
                                                {
                                                    required: true, message: 'Por favor selecione a posição',
                                                }
                                            ]
                                        })(
                                            <Select
                                                showSearch
                                                optionFilterProp="children"
                                                style={{ width: '100%' }}
                                                placeholder="Selecione"
                                                getPopupContainer={() => document.getElementById('colAlteracaoEndereco')}
                                                allowClear={true}
                                                onChange={this.handleChangePosicao}
                                            >
                                                {
                                                    this.state.posicoesOptions.map((option) => {
                                                        return (<Select.Option key={option.id} value={option.id}>{option.posicao}</Select.Option>)
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>
                                    <Button className="buttonGreen" onClick={this.buildRequest} loading={this.state.btnLoadingAlterarEndereco}><Icon type="check" /> Alterar Endereço</Button>
                                </Form>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            }
            </Modal>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint,
        producaoMainData: state.producaoMainData,
        session: state.session
	}
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(ModalAlteracaoEndereco)))