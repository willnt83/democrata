import React, { Component } from 'react'
import { Row, Col, Form, Icon, Button, Input } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import BarcodeReader from 'react-barcode-reader'

class ComponentLancamento extends Component{
    constructor(props){
        super(props);
        this.inputBarcode = React.createRef()
        this.aguardandoBip = React.createRef()
    }
    state = {
        manual: false,
        btnLoadingEstornar: false,
        processando: false
    }

    toggleTipoLancamento = () => {
        this.setState({manual: !this.state.manual})
    }

    lancarManual = () => {
        this.setState({btnLoadingEstornar: true})
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                var dataArr = values.produtoBarcode.split('-')
                if(parseInt(dataArr[3]) !== 8 || dataArr.length < 6)
                    this.props.showNotification('Código de barras inválido', false)
                else{
                    this.estornar(values.produtoBarcode)
                }
            }
        })
    }

    handleScan = (data) => {
        if(!this.state.processando){
            var dataArr = data.split('-')
            if(parseInt(dataArr[3]) !== 8 || dataArr.length < 6)
                this.props.componentLancamentoReturn('Código de barras inválido', false)
            else{
                this.setState({processando: true})
                this.estornar(data)
            }
        }
        else
            this.props.componentLancamentoReturn('Aguarde a finalização do lançamento anterior...', false)

    }

    estornar = (cod) => {
        console.log('this.props.tabKey', this.props.tabKey)
        var uri = ''
        if(this.props.tabKey === 1) uri = '/wms-produtos/estornarEntradaProduto'
        else if(this.props.tabKey === 2) uri = '/wms-produtos/estornarArmazenagemProduto'
        else if(this.props.tabKey === 3) uri = '/wms-produtos/estornarSaidaProduto'

        console.log('uri', uri)
            
        var request = {
            idUsuario: this.props.session.usuario.id,
            codigo: cod
        }

        axios.post(this.props.backEndPoint + uri, request)
        .then(res => {
            this.setState({processando: false})
            this.props.componentLancamentoReturn(res.data.msg, res.data.success)
            if(this.state.manual){
                this.setState({btnLoadingEstornar: false})
                this.props.form.setFieldsValue({produtoBarcode: null})
            }
        })
        .catch(error => {
            this.setState({processando: false})
            if(this.state.manual){
                this.setState({btnLoadingEstornar: false})
                this.props.form.setFieldsValue({produtoBarcode: null})
            }
            console.log(error)
        })
    }

    componentDidUpdate(prevProps, prevState){
        // Focus no input de código de barras
        if(prevState.manual !== this.state.manual && this.state.manual)
            this.inputBarcode.current.focus();
    }

    handleError(err){
        console.error(err)
    }

    render(){
        const { getFieldDecorator } = this.props.form
        return(
            <Row style={{ marginBottom: 16 }}>
                {
                    !this.state.manual ?
                        <React.Fragment>
                            <BarcodeReader
                                onError={this.handleError}
                                onScan={this.handleScan}
                            />
                            <Col span={16} className="bold">
                                Aguardando bip...
                            </Col>
                        </React.Fragment>
                    :
                        <Col span={16}>
                            <Row style={{marginBottom: 15}}>
                                <Col span={24} className="bold">Lançamento Manual</Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <Form.Item label="Código de Barras do Produto">
                                        {getFieldDecorator('produtoBarcode', {
                                        rules: [{
                                            required: true, message: "Informe o código de barras do produto a ser estornado"
                                        }],
                                    })(
                                            <Input
                                                id="produtoBarcode"
                                                ref={this.inputBarcode}
                                            />
                                        )}
                                    </Form.Item>
                                    <Button className="buttonBlue" onClick={this.lancarManual} loading={this.state.btnLoadingEstornar}><Icon type="undo"/>Estornar</Button>
                                </Col>
                            </Row>

                        </Col>
                }
                <Col span={8} align="end">
                    {
                        !this.state.manual ?
                            <Button className="buttonPurple" onClick={() => this.toggleTipoLancamento()}><Icon type="number" />Manual</Button>
                        :
                            <Button className="buttonBlue" onClick={() => this.toggleTipoLancamento()}><Icon type="scan" />Bip</Button>
                    }
                    
                </Col>
            </Row>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint,
        session: state.session
	}
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(ComponentLancamento)))